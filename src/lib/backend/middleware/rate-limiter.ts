import { NextRequest, NextResponse } from 'next/server'
import { redis } from '../cache/redis-client'
import { logger } from '../monitoring/logger'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

export class RateLimiter {
  private config: Required<RateLimitConfig>
  
  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getClientIP(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later',
      ...config
    }
  }
  
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfIP = request.headers.get('cf-connecting-ip')
    
    return cfIP || realIP || forwarded?.split(',')[0] || 'unknown'
  }
  
  async isAllowed(request: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    total: number
  }> {
    const key = `rate_limit:${this.config.keyGenerator(request)}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    try {
      // Use Redis sorted set for sliding window
      const pipeline = redis.pipeline()
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiration
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000))
      
      const results = await pipeline.exec()
      const currentCount = (results?.[1]?.[1] as number) || 0
      
      const allowed = currentCount < this.config.maxRequests
      const remaining = Math.max(0, this.config.maxRequests - currentCount - 1)
      const resetTime = now + this.config.windowMs
      
      return {
        allowed,
        remaining,
        resetTime,
        total: this.config.maxRequests
      }
    } catch (error) {
      logger.error('Rate limiter error', { error, key })
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
        total: this.config.maxRequests
      }
    }
  }
  
  middleware() {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const result = await this.isAllowed(request)
      
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          ip: this.getClientIP(request),
          path: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent')
        })
        
        return NextResponse.json(
          { 
            error: this.config.message,
            retryAfter: Math.ceil(this.config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil(this.config.windowMs / 1000).toString()
            }
          }
        )
      }
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      
      return null // Continue to next middleware
    }
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
  }),
  
  // Authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
  }),
  
  // Search endpoints
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 searches per minute
  }),
  
  // Admin endpoints
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute for admin
  }),
  
  // File upload endpoints
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
  })
}

// Rate limiting middleware factory
export function createRateLimit(config: RateLimitConfig) {
  const limiter = new RateLimiter(config)
  return limiter.middleware()
}