// Optimized backend exports
export * from './services/product-service'
export * from './services/order-service'
export * from './services/checkout-service'
export * from './services/cart-service'
export * from './middleware/security'
export * from './middleware/rate-limiter'
export * from './middleware/api-wrapper'
export * from './cache/redis-client'
// Database connection is exported from @/lib/db
// export * from './database/connection'
export * from './monitoring/logger'