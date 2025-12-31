import { z } from 'zod'
import { NextResponse } from 'next/server'
import { 
  createAuthenticatedAPIRoute, 
  createAdminAPIRoute,
  createPaginatedResponse,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { orderService } from '@/lib/backend/services/order-service'
import { paginationSchema } from '@/lib/validations'

// Query schema for order filtering
const orderFiltersSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional()
})

export const GET = createAuthenticatedAPIRoute(
  async (_, { user, query }) => {
    try {
      const isAdmin = user.role === 'ADMIN'
      const pagination = {
        page: typeof query.page === 'number' ? query.page : 1,
        limit: typeof query.limit === 'number' ? query.limit : 10,
      }
      
      if (isAdmin) {
        // Admin can see all orders with filters
        const filters: any = {}
        
        if (query.status) filters.status = query.status
        if (query.userId) filters.userId = query.userId
        if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom)
        if (query.dateTo) filters.dateTo = new Date(query.dateTo)
        
        let result
        if (query.search) {
          // Use search functionality
          result = await orderService.searchOrders(query.search, pagination)
        } else {
          // Use filtered query
          result = await orderService.getAllOrders(pagination, filters)
        }
        
        return createPaginatedResponse(
          result.data,
          result.pagination,
          'Orders retrieved successfully'
        )
      } else {
        // Regular user can only see their own orders
        const result = await orderService.getUserOrders(user.id, pagination)
        
        return createPaginatedResponse(
          result.data,
          result.pagination,
          'Your orders retrieved successfully'
        )
      }
    } catch (error) {
      console.error('Orders API failed.', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch orders. Please try again or contact support if the issue persists.',
        },
        { status: 500 }
      )
    }
  },
  {
    rateLimit: 'api',
    validation: {
      query: paginationSchema.merge(orderFiltersSchema)
    },
    cache: {
      ttl: 300, // 5 minutes
      tags: ['orders']
    }
  }
)

// Admin-only endpoint for order operations
const orderActionSchema = z.object({
  action: z.enum(['getStats', 'bulkUpdateStatus']),
  userId: z.string().optional(),
  orderIds: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional()
})

export const POST = createAdminAPIRoute(
  async (_, { body }) => {
    const { action, ...params } = body

    switch (action) {
      case 'getStats':
        const stats = await orderService.getOrderStats(params.userId)
        return createSuccessResponse(stats, 'Order statistics retrieved successfully')

      case 'bulkUpdateStatus':
        if (!params.orderIds || !params.status) {
          throw new Error('Missing orderIds or status for bulk update')
        }
        
        const updatedCount = await orderService.bulkUpdateOrderStatus(
          params.orderIds,
          params.status
        )
        
        return createSuccessResponse(
          { updatedCount },
          `Updated ${updatedCount} orders successfully`
        )

      default:
        throw new Error('Invalid action specified')
    }
  },
  {
    rateLimit: 'admin',
    validation: {
      body: orderActionSchema
    }
  }
)