import { cache } from '../cache/redis-client'
import { logger } from '../monitoring/logger'
import { ProductRepository } from '@/lib/product-repository'
import type {
  Product,
  PaginatedResponse
} from '@/types'
import type { PaginationInput, ProductFiltersInput, CreateProductInput, UpdateProductInput } from '@/lib/validations'

export class ProductService {
  private cachePrefix = 'product:'
  private cacheTTL = 3600 // 1 hour

  async createProduct(data: CreateProductInput): Promise<Product> {
    try {
      logger.info('Creating new product', { name: data.name, slug: data.slug })
      
      // Validate unique constraints
      if (data.slug) {
        const existingBySlug = await ProductRepository.getProductRepository().findBySlug(data.slug)
        if (existingBySlug) {
          throw new Error(`Product with slug '${data.slug}' already exists`)
        }
      }
      
      const product = await ProductRepository.getProductRepository().create(data)
      
      // Cache the new product
      await this.cacheProduct(product)
      
      // Invalidate related caches
      await this.invalidateProductListCaches()
      
      logger.info('Product created successfully', { 
        productId: product.id, 
        name: product.name 
      })
      
      return product
    } catch (error) {
      logger.error('Failed to create product', { error, data })
      throw error
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      // Try cache first
      const cacheKey = `${this.cachePrefix}${id}`
      const cached = await cache.get<Product>(cacheKey)
      
      if (cached) {
        logger.debug('Product cache hit', { productId: id })
        return cached
      }
      
      // Fetch from database
      const product = await ProductRepository.getProductRepository().findById(id)
      
      if (product) {
        // Cache for future requests
        await this.cacheProduct(product)
        logger.debug('Product cached', { productId: id })
      }
      
      return product
    } catch (error) {
      logger.error('Failed to get product', { error, productId: id })
      throw error
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const cacheKey = `${this.cachePrefix}slug:${slug}`
      const cached = await cache.get<Product>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const product = await ProductRepository.getProductRepository().findBySlug(slug)
      
      if (product) {
        await cache.set(cacheKey, product, { 
          ttl: this.cacheTTL,
          tags: ['products', `product:${product.id}`]
        })
      }
      
      return product
    } catch (error) {
      logger.error('Failed to get product by slug', { error, slug })
      throw error
    }
  }

  async getProducts(
    filters: ProductFiltersInput = {},
    pagination: PaginationInput = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Product>> {
    try {
      // Create cache key based on filters and pagination
      const cacheKey = this.generateProductListCacheKey(filters, pagination)
      const cached = await cache.get<PaginatedResponse<Product>>(cacheKey)
      
      if (cached) {
        logger.debug('Product list cache hit', { filters, pagination })
        return cached
      }
      
      const result = await ProductRepository.getProductRepository().findMany(filters, pagination)
      
      // Cache the result
      await cache.set(cacheKey, result, {
        ttl: 300, // 5 minutes for product lists
        tags: ['products', 'product-lists']
      })
      
      return result
    } catch (error) {
      logger.error('Failed to get products', { error, filters, pagination })
      throw error
    }
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    try {
      logger.info('Updating product', { productId: id, updates: Object.keys(data) })
      
      // Validate unique constraints if being updated
      if (data.slug) {
        const existingBySlug = await ProductRepository.getProductRepository().findBySlug(data.slug)
        if (existingBySlug && existingBySlug.id !== id) {
          throw new Error(`Product with slug '${data.slug}' already exists`)
        }
      }
      
      const product = await ProductRepository.getProductRepository().update(id, data)
      
      // Update cache
      await this.cacheProduct(product)
      
      // Invalidate related caches
      await this.invalidateProductListCaches()
      
      logger.info('Product updated successfully', { productId: id })
      
      return product
    } catch (error) {
      logger.error('Failed to update product', { error, productId: id, data })
      throw error
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      logger.info('Deleting product', { productId: id })
      
      await ProductRepository.getProductRepository().delete(id)
      
      // Remove from cache
      await this.invalidateProductCache(id)
      await this.invalidateProductListCaches()
      
      logger.info('Product deleted successfully', { productId: id })
    } catch (error) {
      logger.error('Failed to delete product', { error, productId: id })
      throw error
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const cacheKey = `${this.cachePrefix}featured:${limit}`
      const cached = await cache.get<Product[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const products = await ProductRepository.getProductRepository().getFeaturedProducts(limit)
      
      await cache.set(cacheKey, products, {
        ttl: 1800, // 30 minutes
        tags: ['products', 'featured-products']
      })
      
      return products
    } catch (error) {
      logger.error('Failed to get featured products', { error, limit })
      throw error
    }
  }

  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    try {
      const cacheKey = `${this.cachePrefix}new-arrivals:${limit}`
      const cached = await cache.get<Product[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const products = await ProductRepository.getProductRepository().getNewArrivals(limit)
      
      await cache.set(cacheKey, products, {
        ttl: 1800, // 30 minutes
        tags: ['products', 'new-arrivals']
      })
      
      return products
    } catch (error) {
      logger.error('Failed to get new arrivals', { error, limit })
      throw error
    }
  }

  async getPopularProducts(limit: number = 8): Promise<Product[]> {
    try {
      const cacheKey = `${this.cachePrefix}popular:${limit}`
      const cached = await cache.get<Product[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const products = await ProductRepository.getProductRepository().getPopularProducts(limit)
      
      await cache.set(cacheKey, products, {
        ttl: 3600, // 1 hour
        tags: ['products', 'popular-products']
      })
      
      return products
    } catch (error) {
      logger.error('Failed to get popular products', { error, limit })
      throw error
    }
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      if (!query.trim()) {
        return []
      }
      
      const cacheKey = `${this.cachePrefix}search:${query}:${limit}`
      const cached = await cache.get<Product[]>(cacheKey)
      
      if (cached) {
        return cached
      }
      
      const products = await ProductRepository.searchProducts(query, { page: 1, limit })
      
      await cache.set(cacheKey, products, {
        ttl: 600, // 10 minutes
        tags: ['products', 'search-results']
      })
      
      return products.data
    } catch (error) {
      logger.error('Failed to search products', { error, query, limit })
      throw error
    }
  }

  async incrementViewCount(productId: string): Promise<void> {
    try {
      await ProductRepository.incrementViewCount(productId)
      
      // Invalidate product cache to reflect updated view count
      await this.invalidateProductCache(productId)
      
      logger.debug('Product view count incremented', { productId })
    } catch (error) {
      logger.error('Failed to increment view count', { error, productId })
      // Don't throw error for view count failures
    }
  }

  async checkInventoryAvailability(productId: string, quantity: number): Promise<boolean> {
    try {
      // TODO: Implement actual inventory checking
      // For now, return true as a placeholder
      return true
    } catch (error) {
      logger.error('Failed to check inventory availability', { 
        error, 
        productId, 
        quantity 
      })
      return false
    }
  }

  async updateInventory(productId: string, quantity: number): Promise<Product> {
    try {
      logger.info('Updating product inventory', { productId, quantity })
      
      // TODO: Implement actual inventory updating
      // For now, just get the current product
      const product = await ProductRepository.getProductRepository().findById(productId)
      if (!product) {
        throw new Error('Product not found')
      }
      
      // Update cache
      await this.cacheProduct(product)
      
      logger.info('Product inventory updated', { 
        productId, 
        newInventory: quantity 
      })
      
      return product
    } catch (error) {
      logger.error('Failed to update inventory', { error, productId, quantity })
      throw error
    }
  }

  // Cache management methods
  private async cacheProduct(product: Product): Promise<void> {
    const cacheKey = `${this.cachePrefix}${product.id}`
    await cache.set(cacheKey, product, {
      ttl: this.cacheTTL,
      tags: ['products', `product:${product.id}`]
    })
    
    // Also cache by slug if available
    if (product.slug) {
      const slugCacheKey = `${this.cachePrefix}slug:${product.slug}`
      await cache.set(slugCacheKey, product, {
        ttl: this.cacheTTL,
        tags: ['products', `product:${product.id}`]
      })
    }
  }

  private async invalidateProductCache(productId: string): Promise<void> {
    await cache.invalidateByTag(`product:${productId}`)
  }

  private async invalidateProductListCaches(): Promise<void> {
    await Promise.all([
      cache.invalidateByTag('product-lists'),
      cache.invalidateByTag('featured-products'),
      cache.invalidateByTag('new-arrivals'),
      cache.invalidateByTag('popular-products'),
      cache.invalidateByTag('search-results')
    ])
  }

  private generateProductListCacheKey(
    filters: ProductFiltersInput,
    pagination: PaginationInput
  ): string {
    const filterStr = JSON.stringify(filters)
    const paginationStr = JSON.stringify(pagination)
    return `${this.cachePrefix}list:${Buffer.from(filterStr + paginationStr).toString('base64')}`
  }
}

export const productService = new ProductService()