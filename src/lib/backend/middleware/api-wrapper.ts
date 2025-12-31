import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimiters } from './rate-limiter'
import { 
  withSecurity,
  sanitizeInput 
} from './security'
import { withRequestLogging, log } from '../monitoring/logger'
import { performanceMonitor } from '../monitoring/logger'

// API Response wrapper for consistent responses
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function createAPIResponse<T>(
  data?: T,
  message?: string,
  pagination?: any
): APIResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination
  }
}

export function createErrorResponse(
  error: string,
  code?: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    code
  }, { status })
}

// Enhanced API route wrapper with all optimizations
export interface APIRouteConfig {
  auth?: 'none' | 'user' | 'admin'
  rateLimit?: 'api' | 'auth' | 'search' | 'admin' | 'upload' | 'none'
  validation?: {
    body?: z.ZodSchema
    query?: z.ZodSchema
  }
  cache?: {
    ttl?: number
    tags?: string[]
  }
}

export function createAPIRoute(
  handler: (
    request: NextRequest,
    context: {
      user?: any
      body?: any
      query?: any
      requestId: string
    }
  ) => Promise<NextResponse>,
  config: APIRouteConfig = {}
) {
  return withSecurity(
    withRequestLogging(async (request: NextRequest, requestContext) => {
      const startTime = Date.now()
      
      try {
        // Rate limiting
        if (config.rateLimit && config.rateLimit !== 'none') {
          const rateLimiter = rateLimiters[config.rateLimit]
          if (rateLimiter) {
            const rateLimitResult = await rateLimiter.isAllowed(request)
            if (!rateLimitResult.allowed) {
              return NextResponse.json(
                { 
                  success: false,
                  error: 'Rate limit exceeded',
                  code: 'RATE_LIMIT_EXCEEDED',
                  retryAfter: Math.ceil(15 * 60) // 15 minutes
                },
                { 
                  status: 429,
                  headers: {
                    'X-RateLimit-Limit': rateLimitResult.total.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                    'Retry-After': '900' // 15 minutes in seconds
                  }
                }
              )
            }
          }
        }

        // Authentication
        let user: any = null
        if (config.auth === 'user' || config.auth === 'admin') {
          try {
            const { getServerSession } = await import('next-auth')
            const { authOptions } = await import('@/lib/auth')
            const session = await getServerSession(authOptions)
            
            if (!session?.user) {
              return createErrorResponse('Unauthorized', 'AUTH_REQUIRED', 401)
            }
            
            if (config.auth === 'admin' && session.user.role !== 'ADMIN') {
              return createErrorResponse('Forbidden - Admin access required', 'ADMIN_REQUIRED', 403)
            }
            
            user = session.user
          } catch (error) {
            log.error(error as Error, { context: 'authentication' })
            return createErrorResponse('Authentication failed', 'AUTH_ERROR', 500)
          }
        }

        // Parse and validate request data
        let body: any = null
        let query: any = null

        // Parse query parameters
        const { searchParams } = new URL(request.url)
        query = Object.fromEntries(searchParams.entries())
        
        // Convert string numbers to numbers in query
        for (const [key, value] of Object.entries(query)) {
          if (typeof value === 'string' && !isNaN(Number(value))) {
            query[key] = Number(value)
          }
          // Convert boolean strings
          if (value === 'true') query[key] = true
          if (value === 'false') query[key] = false
        }

        // Parse body for non-GET requests
        if (request.method !== 'GET' && request.method !== 'DELETE') {
          try {
            const rawBody = await request.json()
            body = sanitizeInput(rawBody)
          } catch (error) {
            return createErrorResponse('Invalid JSON body', 'INVALID_JSON', 400)
          }
        }

        // Validate query parameters
        if (config.validation?.query) {
          const queryValidation = config.validation.query.safeParse(query)
          if (!queryValidation.success) {
            return NextResponse.json({
              success: false,
              error: 'Invalid query parameters',
              code: 'VALIDATION_ERROR',
              details: queryValidation.error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
                code: issue.code
              }))
            }, { status: 400 })
          }
          query = queryValidation.data
        }

        // Validate body
        if (config.validation?.body && body) {
          const bodyValidation = config.validation.body.safeParse(body)
          if (!bodyValidation.success) {
            return NextResponse.json({
              success: false,
              error: 'Invalid request body',
              code: 'VALIDATION_ERROR',
              details: bodyValidation.error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
                code: issue.code
              }))
            }, { status: 400 })
          }
          body = bodyValidation.data
        }

        // Execute the handler
        const response = await handler(request, {
          user,
          body,
          query,
          requestId: requestContext.requestId
        })

        // Add performance metrics
        const duration = Date.now() - startTime
        performanceMonitor.recordMetric('api_request_duration', duration)
        
        // Add cache headers if configured
        if (config.cache?.ttl) {
          response.headers.set(
            'Cache-Control', 
            `public, s-maxage=${config.cache.ttl}, stale-while-revalidate=${config.cache.ttl * 2}`
          )
        }

        // Add performance headers
        response.headers.set('X-Response-Time', `${duration}ms`)
        response.headers.set('X-Request-ID', requestContext.requestId)

        return response

      } catch (error) {
        const duration = Date.now() - startTime
        
        log.error(error as Error, {
          ...requestContext,
          duration,
          config
        })

        // Return appropriate error response
        if (error instanceof Error) {
          return createErrorResponse(
            process.env.NODE_ENV === 'production' 
              ? 'Internal server error' 
              : error.message,
            'INTERNAL_ERROR',
            500
          )
        }

        return createErrorResponse('Unknown error occurred', 'UNKNOWN_ERROR', 500)
      }
    })
  )
}

// Specialized wrappers for common patterns
export function createPublicAPIRoute(
  handler: (request: NextRequest, context: { query?: any; body?: any; requestId: string }) => Promise<NextResponse>,
  config: Omit<APIRouteConfig, 'auth'> = {}
) {
  return createAPIRoute(handler, { ...config, auth: 'none' })
}

export function createAuthenticatedAPIRoute(
  handler: (request: NextRequest, context: { user?: any; query?: any; body?: any; requestId: string }) => Promise<NextResponse>,
  config: Omit<APIRouteConfig, 'auth'> = {}
) {
  return createAPIRoute(handler, { ...config, auth: 'user' })
}

export function createAdminAPIRoute(
  handler: (request: NextRequest, context: { user?: any; query?: any; body?: any; requestId: string }) => Promise<NextResponse>,
  config: Omit<APIRouteConfig, 'auth'> = {}
) {
  return createAPIRoute(handler, { ...config, auth: 'admin' })
}

// Utility function for paginated responses
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string
): NextResponse {
  return NextResponse.json(createAPIResponse(data, message, pagination))
}

// Utility function for success responses
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(createAPIResponse(data, message), { status })
}

// Background job queue integration (placeholder for future implementation)
export interface BackgroundJob {
  type: string
  payload: any
  delay?: number
  attempts?: number
}

export async function enqueueJob(job: BackgroundJob): Promise<void> {
  // TODO: Implement with Bull Queue or similar
  log.business('Background job enqueued', { job })
}

// Health check utilities
export function createHealthCheckRoute() {
  return createPublicAPIRoute(async () => {
    const checks = {
      database: false,
      cache: false,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }

    try {
      // Check database connection
      const { dbHealth } = await import('../database/connection')
      const dbStatus = await dbHealth.getStatus()
      checks.database = dbStatus.healthy

      // Check cache connection
      const { cache } = await import('../cache/redis-client')
      const cacheStats = await cache.getStats()
      checks.cache = cacheStats.connected

      const allHealthy = Object.values(checks).every(check => 
        typeof check === 'boolean' ? check : true
      )

      return NextResponse.json({
        success: true,
        data: {
          status: allHealthy ? 'healthy' : 'unhealthy',
          checks
        }
      }, { 
        status: allHealthy ? 200 : 503 
      })

    } catch (error) {
      log.error(error as Error, { context: 'health-check' })
      
      return NextResponse.json({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          checks
        }
      }, { status: 503 })
    }
  })
}