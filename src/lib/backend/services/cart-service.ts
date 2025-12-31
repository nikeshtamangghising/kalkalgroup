import { cache } from '../cache/redis-client'
import { logger } from '../monitoring/logger'
import CartRepository from '@/lib/cart-repository'
import { productService } from './product-service'

export class CartService {
  private cachePrefix = 'cart:'
  private cacheTTL = 1800 // 30 minutes

  async addToCart(data: {
    productId: string
    quantity: number
    userId?: string
    sessionId?: string
  }) {
    try {
      const identifier = data.userId ? 'user' : 'session'
      const identifierValue = data.userId || data.sessionId!
      
      logger.info('Adding item to cart', {
        productId: data.productId,
        quantity: data.quantity,
        identifier,
        identifierValue
      })

      // Check product availability
      const isAvailable = await productService.checkInventoryAvailability(
        data.productId,
        data.quantity
      )

      if (!isAvailable) {
        throw new Error('Product is not available in the requested quantity')
      }

      const cartIdentifier = data.userId 
        ? { userId: data.userId }
        : { sessionId: data.sessionId! }

      const cartItem = await CartRepository.addToCart({
        productId: data.productId,
        quantity: data.quantity,
        ...cartIdentifier
      })

      // Invalidate cart cache
      await this.invalidateCartCache(cartIdentifier)

      logger.info('Item added to cart successfully', {
        cartItemId: cartItem.id,
        productId: data.productId
      })

      return cartItem
    } catch (error) {
      logger.error('Failed to add item to cart', { error, data })
      throw error
    }
  }

  async getCart(identifier: { userId?: string; sessionId?: string }) {
    try {
      const cacheKey = this.generateCartCacheKey(identifier)
      const cached = await cache.get(cacheKey)

      if (cached) {
        logger.debug('Cart cache hit', { identifier })
        return cached
      }

      const [items, total] = await Promise.all([
        CartRepository.getCartItems(identifier.userId, identifier.sessionId),
        CartRepository.getCartTotal(identifier.userId, identifier.sessionId)
      ])

      const result = {
        items,
        total,
        count: items.reduce((sum, item) => sum + item.quantity, 0)
      }

      // Cache the result
      await cache.set(cacheKey, result, {
        ttl: this.cacheTTL,
        tags: ['cart', this.generateCartTag(identifier)]
      })

      return result
    } catch (error) {
      logger.error('Failed to get cart', { error, identifier })
      throw error
    }
  }

  async getCartSummary(identifier: { userId?: string; sessionId?: string }) {
    try {
      const cacheKey = `${this.generateCartCacheKey(identifier)}:summary`
      const cached = await cache.get(cacheKey)

      if (cached) {
        return cached
      }

      const [allItems, total] = await Promise.all([
        CartRepository.getCartItems(identifier.userId, identifier.sessionId),
        CartRepository.getCartTotal(identifier.userId, identifier.sessionId)
      ])

      const count = allItems.reduce((sum, item) => sum + item.quantity, 0)
      const recentItems = allItems.slice(0, 3)

      const summary = {
        count,
        total,
        recentItems
      }

      // Cache for shorter time since it's frequently updated
      await cache.set(cacheKey, summary, {
        ttl: 300, // 5 minutes
        tags: ['cart', this.generateCartTag(identifier)]
      })

      return summary
    } catch (error) {
      logger.error('Failed to get cart summary', { error, identifier })
      throw error
    }
  }

  async updateCartItem(
    cartItemId: string,
    quantity: number,
    identifier: { userId?: string; sessionId?: string }
  ) {
    try {
      logger.info('Updating cart item', {
        cartItemId,
        quantity,
        identifier
      })

      const updatedItem = await CartRepository.updateQuantity(
        cartItemId,
        quantity,
        identifier.userId,
        identifier.sessionId
      )

      // Invalidate cart cache
      await this.invalidateCartCache(identifier)

      logger.info('Cart item updated successfully', {
        cartItemId,
        newQuantity: quantity
      })

      return updatedItem
    } catch (error) {
      logger.error('Failed to update cart item', {
        error,
        cartItemId,
        quantity,
        identifier
      })
      throw error
    }
  }

  async removeFromCart(
    cartItemId: string,
    identifier: { userId?: string; sessionId?: string }
  ) {
    try {
      logger.info('Removing item from cart', {
        cartItemId,
        identifier
      })

      await CartRepository.removeFromCart(cartItemId, identifier.userId, identifier.sessionId)

      // Invalidate cart cache
      await this.invalidateCartCache(identifier)

      logger.info('Item removed from cart successfully', { cartItemId })
    } catch (error) {
      logger.error('Failed to remove item from cart', {
        error,
        cartItemId,
        identifier
      })
      throw error
    }
  }

  async clearCart(identifier: { userId?: string; sessionId?: string }) {
    try {
      logger.info('Clearing cart', { identifier })

      await CartRepository.clearCart(identifier.userId, identifier.sessionId)

      // Invalidate cart cache
      await this.invalidateCartCache(identifier)

      logger.info('Cart cleared successfully', { identifier })
    } catch (error) {
      logger.error('Failed to clear cart', { error, identifier })
      throw error
    }
  }

  async mergeGuestCartToUser(sessionId: string, userId: string) {
    try {
      logger.info('Merging guest cart to user', { sessionId, userId })

      // Get guest cart items
      const guestItems = await CartRepository.getCartItems(undefined, sessionId)

      if (guestItems.length === 0) {
        return
      }

      // Add each item to user cart
      for (const item of guestItems) {
        try {
          await CartRepository.addToCart({
            productId: item.productId,
            quantity: item.quantity,
            userId
          })
        } catch (error) {
          // Log but continue with other items
          logger.warn('Failed to merge cart item', {
            error,
            productId: item.productId,
            sessionId,
            userId
          })
        }
      }

      // Clear guest cart
      await CartRepository.clearCart(undefined, sessionId)

      // Invalidate both caches
      await Promise.all([
        this.invalidateCartCache({ sessionId }),
        this.invalidateCartCache({ userId })
      ])

      logger.info('Guest cart merged to user successfully', {
        sessionId,
        userId,
        itemCount: guestItems.length
      })
    } catch (error) {
      logger.error('Failed to merge guest cart to user', {
        error,
        sessionId,
        userId
      })
      throw error
    }
  }

  // Cache management methods
  private generateCartCacheKey(identifier: { userId?: string; sessionId?: string }): string {
    if (identifier.userId) {
      return `${this.cachePrefix}user:${identifier.userId}`
    }
    return `${this.cachePrefix}session:${identifier.sessionId}`
  }

  private generateCartTag(identifier: { userId?: string; sessionId?: string }): string {
    if (identifier.userId) {
      return `cart:user:${identifier.userId}`
    }
    return `cart:session:${identifier.sessionId}`
  }

  private async invalidateCartCache(identifier: { userId?: string; sessionId?: string }) {
    const tag = this.generateCartTag(identifier)
    await cache.invalidateByTag(tag)
  }
}

export const cartService = new CartService()