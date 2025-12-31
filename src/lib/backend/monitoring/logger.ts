import pino from 'pino'
import { NextRequest, NextResponse } from 'next/server'

// Logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => ({ level: label }),
    bindings: (bindings: any) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
      service: 'kalkal-ecommerce'
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]'
    ],
    censor: '[REDACTED]'
  }
}

// Create logger instance
const baseLogger = pino(
  loggerConfig,
  process.env.NODE_ENV === 'production' 
    ? undefined // Use default stdout in production
    : pino.destination({ sync: false }) // Async logging in development
)

type LogMethod = typeof baseLogger.info

type FlexibleLogMethod = LogMethod & {
  (msg: string, meta?: Record<string, unknown>, ...rest: unknown[]): void
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const wrapLogMethod = (method: LogMethod): FlexibleLogMethod => {
  const bound = method.bind(baseLogger)
  const wrapped = ((first: unknown, second?: unknown, ...rest: unknown[]) => {
    if (typeof first === 'string') {
      const message = first
      const meta = isPlainObject(second) ? second : undefined
      const remainingArgs = isPlainObject(second) ? rest : [second, ...rest].filter((arg) => arg !== undefined)
      bound(meta ?? {}, message, ...(remainingArgs as []))
      return
    }

    bound(first as Record<string, unknown>, second as string | undefined, ...rest)
  }) as FlexibleLogMethod

  return wrapped
}

export const logger = baseLogger as typeof baseLogger & {
  info: FlexibleLogMethod
  warn: FlexibleLogMethod
  error: FlexibleLogMethod
  debug: FlexibleLogMethod
}

logger.info = wrapLogMethod(baseLogger.info)
logger.warn = wrapLogMethod(baseLogger.warn)
logger.error = wrapLogMethod(baseLogger.error)
logger.debug = wrapLogMethod(baseLogger.debug)

// Request context interface
export interface RequestContext {
  requestId: string
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
  sessionId?: string
  startTime: number
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift()
    }
  }
  
  getMetrics(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null
    
    const sorted = [...values].sort((a, b) => a - b)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }
  
  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Request logger utility
export function createRequestContext(request: NextRequest): RequestContext {
  return {
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        request.headers.get('cf-connecting-ip') || 
        'unknown',
    startTime: Date.now()
  }
}

// Structured logging functions
export const log = {
  // Request logging
  request: (context: RequestContext, extra?: any) => {
    logger.info({
      type: 'request',
      ...context,
      ...extra
    }, `${context.method} ${context.url}`)
  },
  
  // Response logging
  response: (context: RequestContext, status: number, extra?: any) => {
    const duration = Date.now() - context.startTime
    performanceMonitor.recordMetric('request_duration', duration)
    
    const logData = {
      type: 'response',
      ...context,
      status,
      duration,
      ...extra
    }
    
    if (status >= 500) {
      logger.error(logData, `${context.method} ${context.url} - ${status}`)
    } else if (status >= 400) {
      logger.warn(logData, `${context.method} ${context.url} - ${status}`)
    } else {
      logger.info(logData, `${context.method} ${context.url} - ${status}`)
    }
  },
  
  // Database query logging
  query: (query: string, duration: number, extra?: any) => {
    performanceMonitor.recordMetric('db_query_duration', duration)
    
    logger.debug({
      type: 'database',
      query: query.substring(0, 500), // Truncate long queries
      duration,
      ...extra
    }, 'Database query executed')
    
    if (duration > 1000) {
      logger.warn({
        type: 'slow_query',
        query: query.substring(0, 500),
        duration,
        ...extra
      }, 'Slow database query detected')
    }
  },
  
  // Cache operations
  cache: (operation: string, key: string, hit: boolean, duration?: number) => {
    if (duration) {
      performanceMonitor.recordMetric('cache_operation_duration', duration)
    }
    
    logger.debug({
      type: 'cache',
      operation,
      key,
      hit,
      duration
    }, `Cache ${operation}: ${hit ? 'HIT' : 'MISS'}`)
  },
  
  // Security events
  security: (event: string, severity: 'low' | 'medium' | 'high', extra?: any) => {
    const logData = {
      type: 'security',
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...extra
    }
    
    if (severity === 'high') {
      logger.error(logData, `Security event: ${event}`)
    } else if (severity === 'medium') {
      logger.warn(logData, `Security event: ${event}`)
    } else {
      logger.info(logData, `Security event: ${event}`)
    }
  },
  
  // Business events
  business: (event: string, extra?: any) => {
    logger.info({
      type: 'business',
      event,
      timestamp: new Date().toISOString(),
      ...extra
    }, `Business event: ${event}`)
  },
  
  // Error logging with context
  error: (error: Error, context?: any) => {
    logger.error({
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    }, error.message)
  }
}

// Request logging middleware
export function withRequestLogging(
  handler: (request: NextRequest, context: RequestContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = createRequestContext(request)
    
    log.request(context)
    
    try {
      const response = await handler(request, context)
      log.response(context, response.status)
      return response
    } catch (error) {
      log.error(error as Error, context)
      log.response(context, 500, { error: (error as Error).message })
      throw error
    }
  }
}

// Health check logging
export function logHealthCheck(service: string, healthy: boolean, details?: any) {
  const logData = {
    type: 'health_check',
    service,
    healthy,
    timestamp: new Date().toISOString(),
    ...details
  }
  
  if (healthy) {
    logger.debug(logData, `Health check passed: ${service}`)
  } else {
    logger.error(logData, `Health check failed: ${service}`)
  }
}