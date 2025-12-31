import { cache } from '../cache/redis-client'
import { logger } from '../monitoring/logger'
import { OrderRepository } from '@/lib/order-repository'
import { productService } from './product-service'
import type { 
  Order, 
  OrderWithItems, 
  CreateOrderData,
  OrderStatus,
  PaginatedResponse,
  PaginationParams
} from '@/types'

export class OrderService {
  private cachePrefix = 'order:'
  private cacheTTL = 1800 // 30 minutes

  async createOrder(data: CreateOrderData & { shippingAddress?: any; stripePaymentIntentId?: string }): Promise<OrderWithItems> {
    try {
      logger.info('Creating new order', { 
        userId: data.userId, 
        itemCount: data.items.length,
        total: data.total || 0, 
      })
      
      // Validate inventory availability for all items
      await this.validateInventoryAvailability(data.items)
      
      // Create the order
      const order = await OrderRepository.create(data)
      
      // Cache the order
      await this.cacheOrder(order as any)
      
      // Invalidate related caches
      await this.invalidateOrderListCaches()
      
      logger.info('Order created successfully', { 
        orderId: order.id,
        userId: data.userId,
        total: data.total || 0,
      })
      
      return order as any
    } catch (error) {
      logger.error('Failed to create order', { error, data })
      throw error
    }
  }

  async createGuestOrder(data: {
    guestEmail: string
    guestName: string
    items: { productId: string; quantity: number; price: number }[]
    total: number
    grandTotal: number
    shippingAddress: any
    stripePaymentIntentId?: string
  }): Promise<OrderWithItems> {
    try {
      logger.info('Creating guest order', { 
        guestEmail: data.guestEmail,
        itemCount: data.items.length,
        total: data.total || 0, 
      })
      
      // Validate inventory availability
      await this.validateInventoryAvailability(data.items)
      
      const order = await OrderRepository.createGuestOrder(data)
      
      // Cache the order
      await this.cacheOrder(order as any)
      
      // Invalidate related caches
      await this.invalidateOrderListCaches()
      
      logger.info('Guest order created successfully', { 
        orderId: order.id,
        guestEmail: data.guestEmail,
        total: data.total || 0,
      })
      
      return order as any
    } catch (error) {
      logger.error('Failed to create guest order', { error, data })
      throw error
    }
  }

  async getOrder(id: string): Promise<OrderWithItems | null> {
    try {
      // Try cache first
      const cacheKey = `${this.cachePrefix}${id}`
      const cached = await cache.get<OrderWithItems>(cacheKey)
      
      if (cached) {
        logger.debug('Order cache hit', { orderId: id })
        return cached
      }
      
      // Fetch from database
      const order = await OrderRepository.findById(id)
      
      if (order) {
        // Cache for future requests
        await this.cacheOrder(order as any)
        logger.debug('Order cached', { orderId: id })
      }
      
      return order as any
    } catch (error) {
      logger.error('Failed to get order', { error, orderId: id })
      throw error
    }
  }

  async getUserOrders(
    userId: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      // TODO: Implement when OrderRepository has findAll method
      const result = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
      
      // Cache the result
      const cacheKey = `${this.cachePrefix}user:${userId}:${pagination.page}:${pagination.limit}`
      await cache.set(cacheKey, result, {
        ttl: 600, // 10 minutes for user orders
        tags: ['orders', `user-orders:${userId}`]
      })
      
      return result as any
    } catch (error) {
      logger.error('Failed to get user orders', { error, userId, pagination })
      throw error
    }
  }

  async getGuestOrders(
    guestEmail: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      const cacheKey = `${this.cachePrefix}guest:${guestEmail}:${pagination.page}:${pagination.limit}`
      const cached = await cache.get<PaginatedResponse<OrderWithItems>>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      // TODO: Implement guest order tracking when guest functionality is added
      const result = { data: [], pagination: { page: pagination.page || 1, limit: pagination.limit || 10, total: 0, totalPages: 0 } }
      
      await cache.set(cacheKey, result, {
        ttl: 600, // 10 minutes
        tags: ['orders', `guest-orders:${guestEmail}`]
      })
      
      return result as any
    } catch (error) {
      logger.error('Failed to get guest orders', { error, guestEmail, pagination })
      throw error
    }
  }

  async getAllOrders(
    pagination: PaginationParams = { page: 1, limit: 10 },
    filters: {
      status?: OrderStatus
      userId?: string
      dateFrom?: Date
      dateTo?: Date
    } = {}
  ): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      const cacheKey = this.generateOrderListCacheKey(pagination, filters)
      const cached = await cache.get<PaginatedResponse<OrderWithItems>>(cacheKey)
      
      if (cached) {
        logger.debug('All orders cache hit', { pagination, filters })
        return cached
      }
      
      const result = await OrderRepository.findAll({
        page: pagination.page || 1,
        limit: pagination.limit || 10
      }, filters)
      
      // Cache the result
      await cache.set(cacheKey, result, {
        ttl: 300, // 5 minutes for admin order lists
        tags: ['orders', 'order-lists']
      })
      
      return result as any
    } catch (error) {
      logger.error('Failed to get all orders', { error, pagination, filters })
      throw error
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      logger.info('Updating order status', { orderId: id, status })
      
      const order = await OrderRepository.updateStatus(id, status)
      
      // Invalidate order cache
      await this.invalidateOrderCache(id)
      
      // Invalidate related caches
      await this.invalidateOrderListCaches()
      
      logger.info('Order status updated successfully', { 
        orderId: id, 
        newStatus: status 
      })
      
      return order as any
    } catch (error) {
      logger.error('Failed to update order status', { error, orderId: id, status })
      throw error
    }
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<number> {
    try {
      logger.info('Bulk updating order status', { 
        orderCount: orderIds.length, 
        status 
      })
      
      const updatedCount = await OrderRepository.bulkUpdateStatus(orderIds, status)
      
      // Invalidate caches for all updated orders
      await Promise.all([
        ...orderIds.map(id => this.invalidateOrderCache(id)),
        this.invalidateOrderListCaches()
      ])
      
      logger.info('Bulk order status update completed', { 
        updatedCount, 
        requestedCount: orderIds.length 
      })
      
      return updatedCount
    } catch (error) {
      logger.error('Failed to bulk update order status', { 
        error, 
        orderIds, 
        status 
      })
      throw error
    }
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<OrderWithItems | null> {
    try {
      const cacheKey = `${this.cachePrefix}payment:${paymentIntentId}`
      const cached = await cache.get<OrderWithItems>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      // TODO: Implement findByStripePaymentIntentId method
      const order = null // await orderRepository.findByStripePaymentIntentId(paymentIntentId)
      
      // TODO: Add caching when method is implemented
      // if (order) {
      //   await cache.set(cacheKey, order, {
      //     ttl: this.cacheTTL,
      //     tags: ['orders', `order:${order.id}`]
      //   })
      // }
      
      return order as any
    } catch (error) {
      logger.error('Failed to get order by payment intent', { 
        error, 
        paymentIntentId 
      })
      throw error
    }
  }

  async getRecentOrders(limit: number = 10): Promise<OrderWithItems[]> {
    try {
      const cacheKey = `${this.cachePrefix}recent:${limit}`
      const cached = await cache.get<OrderWithItems[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const orders = await OrderRepository.getRecentOrders(limit)
      
      await cache.set(cacheKey, orders, {
        ttl: 300, // 5 minutes
        tags: ['orders', 'recent-orders']
      })
      
      return orders as any[]
    } catch (error) {
      logger.error('Failed to get recent orders', { error, limit })
      throw error
    }
  }

  async searchOrders(
    query: string,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      if (!query.trim()) {
        return {
          data: [],
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: 0,
            totalPages: 0
          }
        }
      }
      
      const cacheKey = `${this.cachePrefix}search:${query}:${pagination.page}:${pagination.limit}`
      const cached = await cache.get<PaginatedResponse<OrderWithItems>>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const result = await OrderRepository.searchOrders(query, {
        page: pagination.page || 1,
        limit: pagination.limit || 10
      })
      
      await cache.set(cacheKey, result, {
        ttl: 300, // 5 minutes
        tags: ['orders', 'search-results']
      })
      
      return result as any
    } catch (error) {
      logger.error('Failed to search orders', { error, query, pagination })
      throw error
    }
  }

  async getOrderStats(userId?: string): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<OrderStatus, number>
  }> {
    try {
      const cacheKey = userId 
        ? `${this.cachePrefix}stats:user:${userId}`
        : `${this.cachePrefix}stats:all`
      
      const cached = await cache.get(cacheKey)
      if (cached) {
        return cached
      }
      
      const stats = await OrderRepository.getOrderStats(userId)
      
      await cache.set(cacheKey, stats, {
        ttl: 1800, // 30 minutes
        tags: ['orders', 'order-stats']
      })
      
      return stats
    } catch (error) {
      logger.error('Failed to get order stats', { error, userId })
      throw error
    }
  }

  async getOrdersRequiringFulfillment(): Promise<OrderWithItems[]> {
    try {
      const cacheKey = `${this.cachePrefix}fulfillment-required`
      const cached = await cache.get<OrderWithItems[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const orders = await OrderRepository.getOrdersRequiringFulfillment()
      
      await cache.set(cacheKey, orders, {
        ttl: 300, // 5 minutes
        tags: ['orders', 'fulfillment-orders']
      })
      
      return orders as any[]
    } catch (error) {
      logger.error('Failed to get orders requiring fulfillment', { error })
      throw error
    }
  }

  // Private helper methods
  private async validateInventoryAvailability(
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    const validationPromises = items.map(async (item) => {
      const isAvailable = await productService.checkInventoryAvailability(
        item.productId,
        item.quantity
      )
      
      if (!isAvailable) {
        throw new Error(
          `Insufficient inventory for product ${item.productId}. Requested: ${item.quantity}`
        )
      }
    })
    
    await Promise.all(validationPromises)
  }

  private async cacheOrder(order: OrderWithItems): Promise<void> {
    const cacheKey = `${this.cachePrefix}${order.id}`
    await cache.set(cacheKey, order, {
      ttl: this.cacheTTL,
      tags: ['orders', `order:${order.id}`]
    })
    
    // Also cache by payment intent if available
    // TODO: Check if stripePaymentIntentId exists in order type
    // if (order.stripePaymentIntentId) {
    //   const paymentCacheKey = `${this.cachePrefix}payment:${order.stripePaymentIntentId}`
    //   await cache.set(paymentCacheKey, order, {
    //     ttl: this.cacheTTL,
    //     tags: ['orders', `order:${order.id}`]
    //   })
    // }
  }

  private async invalidateOrderCache(orderId: string): Promise<void> {
    await cache.invalidateByTag(`order:${orderId}`)
  }

  private async invalidateOrderListCaches(): Promise<void> {
    await Promise.all([
      cache.invalidateByTag('order-lists'),
      cache.invalidateByTag('recent-orders'),
      cache.invalidateByTag('fulfillment-orders'),
      cache.invalidateByTag('order-stats'),
      cache.invalidateByTag('search-results')
    ])
  }

  private generateOrderListCacheKey(
    pagination: PaginationParams,
    filters: any
  ): string {
    const filterStr = JSON.stringify(filters)
    const paginationStr = JSON.stringify(pagination)
    return `${this.cachePrefix}list:${Buffer.from(filterStr + paginationStr).toString('base64')}`
  }
}

export const orderService = new OrderService()