import 'server-only';
import { db } from './db';
import { orders, orderItems, products, users } from './db/schema';
import {
  eq,
  and,
  gte,
  lte,
  like,
  desc,
  sql,
  or
} from 'drizzle-orm';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateOrderInput,
  PaginationInput,
  ProductFiltersInput
} from './validations';
import type {
  PaginatedResponse
} from '@/types';

// Export db for use in other modules
export { db };

// Product operations
export async function createProduct(data: CreateProductInput): Promise<any> {
  // Transform numeric fields to match schema - convert to string for numeric columns
  const productData = {
    ...data,
    basePrice: typeof data.price === 'number' ? data.price.toString() : data.price,
    price: typeof data.price === 'number' ? data.price.toString() : data.price,
    purchasePrice: data.purchasePrice ? (typeof data.purchasePrice === 'number' ? data.purchasePrice.toString() : data.purchasePrice) : null,
    discountPrice: data.discountPrice ? (typeof data.discountPrice === 'number' ? data.discountPrice.toString() : data.discountPrice) : null,
    weight: data.weight ? (typeof data.weight === 'number' ? data.weight.toString() : data.weight) : null,
  }
  const [result] = await db.insert(products).values(productData).returning();
  return result;
}

export async function getProductById(id: string): Promise<any | null> {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function getProductBySlug(slug: string): Promise<any | null> {
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getProducts(
  filters: ProductFiltersInput = {},
  pagination: PaginationInput = { page: 1, limit: 10 }
): Promise<PaginatedResponse<any>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(products.categoryId, filters.category));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.description, `%${filters.search}%`)
      )
    );
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.basePrice, filters.minPrice.toString()));
  }
  
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.basePrice, filters.maxPrice.toString()));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive));
  }

  // Execute queries
  const [productsResult, countResult] = await Promise.all([
    db.select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(products)
      .where(and(...conditions))
  ]);

  const total = Number(countResult[0]?.count || 0);

  return {
    data: productsResult,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<any> {
  // Transform numeric fields to match schema
  const updateData: any = { ...data };
  
  if (data.price !== undefined) {
    updateData.basePrice = typeof data.price === 'number' ? data.price.toString() : data.price;
    updateData.price = typeof data.price === 'number' ? data.price.toString() : data.price;
  }
  if (data.purchasePrice !== undefined) {
    updateData.purchasePrice = data.purchasePrice ? (typeof data.purchasePrice === 'number' ? data.purchasePrice.toString() : data.purchasePrice) : null;
  }
  if (data.discountPrice !== undefined) {
    updateData.discountPrice = data.discountPrice ? (typeof data.discountPrice === 'number' ? data.discountPrice.toString() : data.discountPrice) : null;
  }
  if (data.weight !== undefined) {
    updateData.weight = data.weight ? (typeof data.weight === 'number' ? data.weight.toString() : data.weight) : null;
  }
  
  const [result] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
  return result;
}

export async function deleteProduct(id: string): Promise<any> {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning();
  return result;
}

// Order operations
export async function createOrder(data: CreateOrderInput): Promise<any> {
  // First create the order
  const [order] = await db.insert(orders).values({
    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    subtotal: data.total.toString(),
    grandTotal: data.total.toString(),
    // Add other required fields as needed
  }).returning();

  // Then create order items
  if (data.items && data.items.length > 0) {
    const orderItemsData = data.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productVariantId: item.productId, // Use productId as variantId for now
      nameSnapshot: 'Product', // TODO: Get actual product name
      skuSnapshot: 'SKU', // TODO: Get actual SKU
      price: item.price.toString(),
      quantity: item.quantity,
    }));

    await db.insert(orderItems).values(orderItemsData);
  }

  // Fetch the complete order with items
  const orderResult = await db.select()
    .from(orders)
    .where(eq(orders.id, order.id))
    .limit(1);
  
  if (!orderResult[0]) return null;
  
  const orderData = orderResult[0];
  
  // Fetch items with products
  const itemsResult = await db.select({
    orderItem: orderItems,
    product: products,
  })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));
  
  // Fetch user if exists
  let user = null;
  if (orderData.userId) {
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, orderData.userId))
      .limit(1);
    user = userResult[0] || null;
  }
  
  return {
    ...orderData,
    items: itemsResult.map(item => ({
      ...item.orderItem,
      product: item.product || undefined,
    })),
    user: user || undefined,
  };
}

export async function getOrderById(id: string): Promise<any | null> {
  const orderResult = await db.select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  
  if (!orderResult[0]) return null;
  
  const order = orderResult[0];
  
  // Fetch items with products
  const itemsResult = await db.select({
    orderItem: orderItems,
    product: products,
  })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));
  
  // Fetch user if exists
  let user = null;
  if (order.userId) {
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);
    user = userResult[0] || null;
  }
  
  return {
    ...order,
    items: itemsResult.map(item => ({
      ...item.orderItem,
      product: item.product || undefined,
    })),
    user: user || undefined,
  };
}

export async function getOrdersByUserId(
  userId: string,
  pagination: PaginationInput = { page: 1, limit: 10 }
): Promise<PaginatedResponse<any>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // Execute queries
  const [ordersData, countResult] = await Promise.all([
    db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(eq(orders.userId, userId))
  ]);

  // Fetch items and relations for each order
  const ordersResult = await Promise.all(
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
      
      return {
        ...order,
        items: itemsResult.map(item => ({
          ...item.orderItem,
          product: item.product || undefined,
        })),
        user: userResult || undefined,
      };
    })
  );

  const total = Number(countResult[0]?.count || 0);

  return {
    data: ordersResult,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllOrders(
  pagination: PaginationInput = { page: 1, limit: 10 }
): Promise<PaginatedResponse<any>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // Execute queries
  const [ordersData, countResult] = await Promise.all([
    db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(orders)
  ]);

  const total = Number(countResult[0]?.count || 0);

  return {
    data: ordersData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOrderStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'): Promise<any> {
  const [result] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  return result;
}

// User operations
export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

// Inventory operations
export async function updateProductInventory(productId: string, quantity: number): Promise<any> {
  const [result] = await db.update(products)
    .set({
      inventory: sql`${products.inventory} - ${quantity}`
    })
    .where(eq(products.id, productId))
    .returning();
  return result;
}

export async function checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
  const result = await db.select({
    inventory: products.inventory,
    isActive: products.isActive
  })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  const product = result[0];
  return product ? product.isActive && product.inventory >= quantity : false;
}