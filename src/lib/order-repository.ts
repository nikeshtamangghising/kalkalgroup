import 'server-only'
import { db } from './db'
import { orders, orderItems, products, users, inventoryAdjustments } from './db/schema'
import { eq, and, or, desc, asc, sql, ilike } from 'drizzle-orm'
import type { 
  Order, 
  CreateOrderData
} from '@/types'
import {
  getCachedData,
  generateOrderCacheKey,
  invalidateOrder,
  CACHE_TAGS,
  CACHE_DURATIONS,
} from './cache'

// Helper function to transform order with items
function transformOrderWithItems(order: any, itemsResult: any[], user?: any) {
  return {
    ...order,
    items: itemsResult.map(item => ({
      ...item.orderItem,
      product: item.product || undefined,
    })),
    user: user || undefined,
  };
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface OrderWithItems {
  id: string
  userId: string | null
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  orderNumber: string
  subtotal: string
  taxTotal: string
  shippingTotal: string
  discountTotal: string
  grandTotal: string
  currency: string
  shippingAddressId?: string | null
  billingAddressId?: string | null
  notes?: string | null
  placedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
  user?: any
  shippingAddress?: any
  billingAddress?: any
  payments?: any[]
  shipments?: any[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId: string
  quantity: number
  price: string
  currency: string
  nameSnapshot: string
  skuSnapshot: string
  metadata: any
  createdAt: Date
  updatedAt: Date
}

export class OrderRepository {
  static async create(data: CreateOrderData): Promise<OrderWithItems> {
    // First, validate inventory availability
    for (const item of data.items) {
      const [product] = await db.select({
        name: products.name,
        sku: products.sku
      })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1)
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      
      // TODO: Add inventory check when inventory field is available
      // For now, skip inventory validation
    }

    // Create order
    const [newOrder] = await db.insert(orders).values({
      orderNumber: `ORD-${Date.now()}`,
      userId: data.userId,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'PENDING',
      subtotal: data.total.toString(),
      grandTotal: data.total.toString(),
      placedAt: new Date(),
    }).returning();

    // Create order items
    const itemsData = data.items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      productVariantId: item.productId, // Required by schema
      quantity: item.quantity,
      price: item.price.toString(),
      currency: 'NPR',
      nameSnapshot: '', // TODO: Get from product
      skuSnapshot: '', // TODO: Get from product
      metadata: {},
    }))
    await db.insert(orderItems).values(itemsData)

    // TODO: Update product inventory when inventory field is available
    // For now, skip inventory updates

    // Fetch the complete order with relations
    const order = await this.findById(newOrder.id)

    // Invalidate related caches
    await invalidateOrder(newOrder.id)

    return order!
  }

  static async createGuestOrder(data: {
    guestEmail: string
    guestName: string
    items: { productId: string; quantity: number; price: number; productVariantId?: string; name?: string; sku?: string; metadata?: any }[]
    total: number
    shippingAddress?: any
  }): Promise<OrderWithItems> {
    // First, validate inventory availability
    for (const item of data.items) {
      const [product] = await db.select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        inventory: products.inventory,
      }).from(products).where(eq(products.id, item.productId)).limit(1)

      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
    }

    // Create guest order (without userId)
    const [newOrder] = await db.insert(orders).values({
      orderNumber: `ORD-${Date.now()}`,
      subtotal: data.total.toString(),
      grandTotal: data.total.toString(),
      currency: 'NPR',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'PENDING',
      placedAt: new Date(),
    }).returning();

    // Create order items
    const itemsData = data.items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      productVariantId: item.productId, // Required by schema
      quantity: item.quantity,
      price: item.price.toString(),
      currency: 'NPR',
      nameSnapshot: '', // TODO: Get from product
      skuSnapshot: '', // TODO: Get from product
      metadata: {},
    }))
    await db.insert(orderItems).values(itemsData)

    // TODO: Update product inventory when inventory field is available
    // For now, skip inventory updates

    // Fetch the complete order with relations
    const order = await this.findById(newOrder.id)

    // Invalidate related caches
    await invalidateOrder(newOrder.id)

    return order!
  }

  static async findById(id: string): Promise<OrderWithItems | null> {
    const cacheKey = generateOrderCacheKey(id)
    
    return getCachedData(
      cacheKey,
      async () => {
        // Fetch order
        const orderResult = await db.select()
          .from(orders)
          .where(eq(orders.id, id))
          .limit(1);
        
        if (!orderResult[0]) return null;
        
        const order = orderResult[0];
        
        // Fetch user if exists
        let user = null;
        if (order.userId) {
          const userResult = await db.select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1);
          user = userResult[0] || null;
        }
        
        // Fetch order items with products
        const itemsResult = await db.select({
          orderItem: orderItems,
          product: products,
        })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, id));
        
        return transformOrderWithItems(order, itemsResult, user);
      },
      {
        memoryTtl: CACHE_DURATIONS.SHORT,
        nextjsTags: [CACHE_TAGS.ORDER, `${CACHE_TAGS.ORDER}:${id}`],
        nextjsRevalidate: CACHE_DURATIONS.MEDIUM,
      }
    )
  }

  async findByUserId(
    userId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<OrderWithItems>> {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const [ordersData, [{ count: totalCount }]] = await Promise.all([
      db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(orders)
        .where(eq(orders.userId, userId)),
    ])

    // Fetch items and relations for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const [itemsResult, userResult] = await Promise.all([
          db.select({
            orderItem: orderItems,
            product: products,
          })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id)),
          order.userId ? db.select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null),
        ]);

        return transformOrderWithItems(order, itemsResult, userResult || undefined);
      })
    );

    return {
      data: ordersWithItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  // findByGuestEmail method removed - guestEmail not in schema

  static async updateStatus(id: string, status: string): Promise<Order> {
    const orderResult = await db.select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    
    if (!orderResult[0]) {
      throw new Error('Order not found');
    }
    
    const order = orderResult[0];

    const oldStatus = order.status

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    // TODO: Add tracking number logic when trackingNumber field is available in schema

    // Update order status
    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning()

    // Handle inventory adjustments for cancellations/refunds
    if (oldStatus === 'PENDING_PAYMENT' && (status === 'CANCELLED' || status === 'REFUNDED')) {
      // Get order items for inventory adjustment
      const orderItemsResult = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id))

      for (const item of orderItemsResult) {
        await db.update(products)
          .set({ inventory: sql`${products.inventory} + ${item.quantity}` })
          .where(eq(products.id, item.productId))

        await db.insert(inventoryAdjustments).values({
          productVariantId: item.productVariantId || item.productId,
          quantityChange: item.quantity,
          reason: `Inventory restored for ${status.toLowerCase()} order`,
          referenceType: status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_RETURNED',
          referenceId: id,
        })
      }
    }

    return updatedOrder as Order
  }

  async updateShippingAddress(id: string, addressId: string): Promise<Order> {
    const [order] = await db.select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)

    if (!order) {
      throw new Error('Order not found')
    }

    // Only allow updating shipping address if order is still pending
    if (order.status !== 'PENDING_PAYMENT') {
      throw new Error('Shipping address can only be updated for pending orders')
    }

    const [updatedOrder] = await db.update(orders)
      .set({
        shippingAddressId: addressId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning()

    // Invalidate cache
    await invalidateOrder(id)

    return updatedOrder as Order
  }

  async findByPaymentId(paymentId: string): Promise<OrderWithItems | null> {
    // Note: This method seems misnamed - it's finding by order ID, not payment ID
    // For now, keeping the same behavior
    const orderResult = await db.select()
      .from(orders)
      .where(eq(orders.id, paymentId))
      .limit(1);
    
    if (!orderResult[0]) return null;
    
    const order = orderResult[0];
    
    // Fetch items and user
    const [itemsResult, userResult] = await Promise.all([
      db.select({
        orderItem: orderItems,
        product: products,
      })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id)),
      order.userId ? db.select()
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
    ]);
    
    return transformOrderWithItems(order, itemsResult, userResult || undefined);
  }

  async getRecentOrders(limit: number = 10): Promise<OrderWithItems[]> {
    const ordersData = await db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    
    // Fetch items and relations for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const [itemsResult, userResult] = await Promise.all([
          db.select({
            orderItem: orderItems,
            product: products,
          })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id)),
          order.userId ? db.select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null),
        ]);
        
        return transformOrderWithItems(order, itemsResult, userResult || undefined);
      })
    );
    
    return ordersWithItems;
  }

  async searchOrders(
    query: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<OrderWithItems>> {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    // Build Drizzle where conditions for search
    const conditions: any[] = []
    if (query) {
      conditions.push(
        or(
          ilike(orders.id, `%${query}%`),
          ilike(orders.orderNumber, `%${query}%`),
          sql`EXISTS (SELECT 1 FROM ${users} WHERE ${users.id} = ${orders.userId} AND (${ilike(users.name, `%${query}%`)} OR ${ilike(users.email, `%${query}%`)}))`
        )
      )
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [ordersResult, totalResult] = await Promise.all([
      db.select()
        .from(orders)
        .where(whereClause || sql`1=1`)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(skip),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(orders).where(whereClause || sql`1=1`)
    ])

    // Fetch items and relations for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const [itemsResult, userResult] = await Promise.all([
          db.select({
            orderItem: orderItems,
            product: products,
          })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id)),
          order.userId ? db.select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null),
        ]);
        
        return transformOrderWithItems(order, itemsResult, userResult || undefined);
      })
    );

    return {
      data: ordersWithItems,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
      },
    }
  }

  async getOrdersRequiringFulfillment(): Promise<OrderWithItems[]> {
    const ordersData = await db.select()
      .from(orders)
      .where(eq(orders.fulfillmentStatus, 'PENDING'))
      .orderBy(asc(orders.createdAt));
    
    // Fetch items and relations for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const [itemsResult, userResult] = await Promise.all([
          db.select({
            orderItem: orderItems,
            product: products,
          })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id)),
          order.userId ? db.select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null),
        ]);
        
        return transformOrderWithItems(order, itemsResult, userResult || undefined);
      })
    );
    
    return ordersWithItems;
  }

  async getOrderStats(userId?: string): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<string, number>
  }> {
    const whereClause = userId ? eq(orders.userId, userId) : undefined

    const [
      totalOrdersResult,
      revenueResult,
      ordersByStatusResult
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause),
      db.select({ sum: sql<number>`sum(${orders.grandTotal})` })
        .from(orders)
        .where(whereClause),
      db.execute(sql`
        SELECT ${orders.status}, COUNT(*) as count
        FROM ${orders}
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}
        GROUP BY ${orders.status}
      `) as Promise<Array<{ status: string; count: string }>>
    ])

    const totalOrders = Number(totalOrdersResult[0]?.count || 0)
    const totalRevenue = parseFloat(revenueResult[0]?.sum?.toString() || '0')
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const statusCounts: Record<string, number> = {}
    
    // Process groupBy results
    const ordersByStatus = await ordersByStatusResult
    for (const row of ordersByStatus) {
      statusCounts[row.status] = parseInt(row.count, 10)
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: statusCounts,
    }
  }

  static async bulkUpdateStatus(orderIds: string[], status: string): Promise<number> {
    // For bulk updates, we need to handle tracking numbers and logs individually
    let updatedCount = 0
    
    for (const orderId of orderIds) {
      try {
        await this.updateStatus(orderId, status)
        updatedCount++
      } catch (error) {
        console.error(`Failed to update status for order ${orderId}:`, error)
        // Continue with other orders
      }
    }
    
    return updatedCount
  }

  static async findAll(pagination: { page: number; limit: number }, filters: any = {}): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit
      
      // Build where conditions
      const whereConditions = []
      if (filters.userId) {
        whereConditions.push(eq(orders.userId, filters.userId))
      }
      if (filters.status) {
        whereConditions.push(eq(orders.status, filters.status))
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

      const ordersQuery = db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.grandTotal,
          currency: orders.currency,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          userId: orders.userId,
          // Items will be fetched separately and joined
          // Items will be fetched separately - using sql template for now
          items: sql<OrderItem[]>`(
            SELECT COALESCE(json_agg(
              json_build_object(
                'id', ${orderItems.id},
                'productId', ${orderItems.productId},
                'quantity', ${orderItems.quantity},
                'price', ${orderItems.price},
                'nameSnapshot', ${orderItems.nameSnapshot},
                'skuSnapshot', ${orderItems.skuSnapshot}
              )
            ), '[]'::json)
            FROM ${orderItems} 
            WHERE ${orderItems.orderId} = ${orders.id}
          )`.as('items')
        })
        .from(orders)
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(whereClause)
        .groupBy(orders.id)
        .orderBy(desc(orders.createdAt))
        .limit(pagination.limit)
        .offset(offset)

      const ordersData = await ordersQuery
      
      // Get total count
      const countQuery = db.select({ count: sql`count(*)` }).from(orders).where(whereClause)
      const countResult = await countQuery
      const total = Number(countResult[0]?.count || 0)

      return {
        data: ordersData as unknown as OrderWithItems[],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit)
        }
      }
    } catch (error) {
      console.error('Error finding all orders:', error)
      return {
        data: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  static async searchOrders(_query: string, pagination: { page: number; limit: number }): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      // Simplified implementation - return empty results for now
      // TODO: Implement proper search functionality
      return {
        data: [] as unknown as OrderWithItems[],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error) {
      console.error('Error searching orders:', error)
      return {
        data: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  static async getOrderStats(_userId?: string): Promise<any> {
    try {
      // Simplified implementation - return empty stats for now
      // TODO: Implement proper order stats functionality
      return {
        total: 0,
        byStatus: {}
      }
    } catch (error) {
      console.error('Error getting order stats:', error)
      return {
        total: 0,
        byStatus: {}
      }
    }
  }

  static async getRecentOrders(_limit: number = 10): Promise<OrderWithItems[]> {
    try {
      // Simplified implementation - return empty results for now
      // TODO: Implement proper recent orders functionality
      return [] as unknown as OrderWithItems[]
    } catch (error) {
      console.error('Error getting recent orders:', error)
      return []
    }
  }

  static async getOrdersRequiringFulfillment(): Promise<OrderWithItems[]> {
    try {
      // Simplified implementation - return empty results for now
      // TODO: Implement proper fulfillment orders functionality
      return [] as unknown as OrderWithItems[]
    } catch (error) {
      console.error('Error getting orders requiring fulfillment:', error)
      return []
    }
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository()