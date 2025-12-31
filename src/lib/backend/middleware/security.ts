import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '../monitoring/logger'
import { z } from 'zod'

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// SQL injection prevention
export function validateSQLInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b|\bAND\b).*?[=<>]/i
  ]
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input))
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      logger.warn({
        path: request.nextUrl.pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }, 'Unauthorized access attempt')
      
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }
    
    return handler(request, session)
  } catch (error) {
    logger.error({ error }, 'Authentication error')
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_ERROR' },
      { status: 500 }
    )
  }
}

// Admin authorization middleware
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, session) => {
    if (session.user.role !== 'ADMIN') {
      logger.warn({
        userId: session.user.id,
        path: request.nextUrl.pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }, 'Unauthorized admin access attempt')
      
      return NextResponse.json(
        { error: 'Forbidden - Admin access required', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      )
    }
    
    return handler(req, session)
  })
}

// Request validation middleware
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: any
      
      if (request.method === 'GET') {
        // Parse query parameters
        const { searchParams } = new URL(request.url)
        data = Object.fromEntries(searchParams.entries())
        
        // Convert string numbers to numbers
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && !isNaN(Number(value))) {
            data[key] = Number(value)
          }
        }
      } else {
        // Parse JSON body
        const body = await request.json()
        data = sanitizeInput(body)
      }
      
      const validationResult = schema.safeParse(data)
      
      if (!validationResult.success) {
        logger.warn({
          path: request.nextUrl.pathname,
          errors: validationResult.error.issues,
          data: JSON.stringify(data).substring(0, 500)
        }, 'Validation failed')
        
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code
            }))
          },
          { status: 400 }
        )
      }
      
      return handler(request, validationResult.data)
    } catch (error) {
      logger.error({ error }, 'Request validation error')
      
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON', code: 'INVALID_JSON' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }
  }
}

// CORS middleware
export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }
}

// Security headers middleware
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Comprehensive security middleware
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 })
        return withSecurityHeaders(response)
      }
      
      // Execute handler
      const response = await handler(request)
      
      // Add security headers
      return withSecurityHeaders(response)
    } catch (error) {
      logger.error({ error }, 'Security middleware error')
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      return withSecurityHeaders(response)
    }
  }
}

// API route wrapper with all security features
export function createSecureAPIRoute(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return withSecurity(withCORS(handler))
}