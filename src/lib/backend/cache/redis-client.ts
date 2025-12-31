import Redis from 'ioredis'
import { logger } from '../monitoring/logger'

const redisEnabled = process.env.REDIS_DISABLED !== 'true' && !!process.env.REDIS_HOST

// When Redis is disabled we provide a minimal no-op client so the rest of the
// application can keep working without conditional imports everywhere.
class NoopPipeline {
  zremrangebyscore() { return this }
  zcard() { return this }
  zadd() { return this }
  expire() { return this }
  sadd() { return this }
  del() { return this }
  exec() { return Promise.resolve([]) }
}

class NoopRedis {
  status = 'disabled'
  pipeline() { return new NoopPipeline() }
  async get() { return null }
  async setex() { return 'OK' }
  async del() { return 0 }
  async smembers() { return [] }
  async flushdb() { return 'OK' }
  async info() { return '' }
  on() { return this }
}

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// Create Redis client with error handling or fall back to the no-op client
export const redis: Redis | NoopRedis = redisEnabled ? new Redis(redisConfig) : new NoopRedis()

if (redisEnabled) {
  // Redis event handlers
  redis.on('connect', () => {
    logger.info('Redis connected successfully')
  })

  redis.on('error', (error) => {
    logger.error('Redis connection error', { error })
  })

  redis.on('close', () => {
    logger.warn('Redis connection closed')
  })

  redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...')
  })
} else {
  logger.warn('Redis disabled: set REDIS_HOST (and related env vars) to enable caching.')
}

// Cache interface
export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  compress?: boolean // Compress large values
}

export class CacheManager {
  private defaultTTL = 3600 // 1 hour
  private keyPrefix = process.env.CACHE_PREFIX || 'kalkal:'
  
  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!redisEnabled) return null
      const value = await redis.get(this.getKey(key))
      if (!value) return null
      
      return JSON.parse(value)
    } catch (error) {
      logger.error('Cache get error', { key, error })
      return null
    }
  }
  
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!redisEnabled) return true
      const serialized = JSON.stringify(value)
      const ttl = options.ttl || this.defaultTTL
      const cacheKey = this.getKey(key)
      
      // Set with expiration
      await redis.setex(cacheKey, ttl, serialized)
      
      // Add to tag sets for invalidation
      if (options.tags) {
        const pipeline = redis.pipeline()
        for (const tag of options.tags) {
          pipeline.sadd(`${this.keyPrefix}tag:${tag}`, cacheKey)
          pipeline.expire(`${this.keyPrefix}tag:${tag}`, ttl + 300) // Tag expires 5 min after cache
        }
        await pipeline.exec()
      }
      
      return true
    } catch (error) {
      logger.error('Cache set error', { key, error })
      return false
    }
  }
  
  async del(key: string): Promise<boolean> {
    try {
      if (!redisEnabled) return true
      await redis.del(this.getKey(key))
      return true
    } catch (error) {
      logger.error('Cache delete error', { key, error })
      return false
    }
  }
  
  async invalidateByTag(tag: string): Promise<number> {
    try {
      if (!redisEnabled) return 0
      const tagKey = `${this.keyPrefix}tag:${tag}`
      const keys = await redis.smembers(tagKey)
      
      if (keys.length === 0) return 0
      
      const pipeline = redis.pipeline()
      keys.forEach(key => pipeline.del(key))
      pipeline.del(tagKey)
      
      await pipeline.exec()
      return keys.length
    } catch (error) {
      logger.error('Cache invalidation error', { tag, error })
      return 0
    }
  }
  
  async flush(): Promise<boolean> {
    try {
      if (!redisEnabled) return true
      await redis.flushdb()
      return true
    } catch (error) {
      logger.error('Cache flush error', { error })
      return false
    }
  }
  
  async getStats() {
    try {
      if (!redisEnabled) {
        return { connected: false, disabled: true }
      }
      const info = await redis.info('memory')
      const keyspace = await redis.info('keyspace')
      
      return {
        memory: info,
        keyspace,
        connected: redis.status === 'ready'
      }
    } catch (error) {
      logger.error('Cache stats error', { error })
      return { connected: false }
    }
  }
}

export const cache = new CacheManager()

// Cache decorators
export function Cached(options: CacheOptions & { key: (args: any[]) => string }) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = options.key(args)
      
      // Try to get from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }
      
      // Execute method and cache result
      const result = await method.apply(this, args)
      await cache.set(cacheKey, result, options)
      
      return result
    }
    
    return descriptor
  }
}