import 'server-only'
import { db } from './db'
import { products } from './db/schema'
import { eq, desc, sql, and, inArray } from 'drizzle-orm'

export interface RecommendationResult {
  productId: string
  score: number
  reason: string
}

export class RecommendationRepository {
  static async getTrending(limit: number = 12): Promise<{ products: RecommendationResult[]; total: number }> {
    return this.getPopular(limit)
  }

  static async getPopular(limit: number = 12): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.popularityScore))
        .limit(limit)

      return {
        products: result.map(p => ({
          productId: p.id,
          score: parseFloat(p.popularityScore || '0'),
          reason: 'popular'
        })),
        total: result.length
      }
    } catch (error) {
      console.error('Error fetching popular products:', error)
      return { products: [], total: 0 }
    }
  }

  static async getPersonalized(userId: string, limit: number = 12): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      // Handle Guest / No User
      if (!userId || userId === 'guest') {
        return this.getPopular(limit)
      }

      // For now, return popular products as a fallback
      // In a real implementation, you would:
      // 1. Fetch user's order history
      // 2. Analyze purchase patterns
      // 3. Get products from similar categories
      // 4. Score based on user behavior
      
      return this.getPopular(limit)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return this.getPopularFallback(limit)
    }
  }

  static async getPopularFallback(limit: number): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          basePrice: products.basePrice,
          thumbnailUrl: products.thumbnailUrl,
          slug: products.slug,
        })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(desc(products.createdAt))
        .limit(limit)

      const recommendations: RecommendationResult[] = result.map((product: any, index: number) => ({
        productId: product.id,
        score: limit - index,
        reason: 'popular'
      }))

      return {
        products: recommendations,
        total: recommendations.length
      }
    } catch (error) {
      console.error('Error getting popular fallback recommendations:', error)
      return { products: [], total: 0 }
    }
  }

  static async getRelated(productId: string, limit: number = 6): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      // Get the product to find its category
      const product = await db
        .select({
          categoryId: products.categoryId,
        })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1)

      if (!product[0]) {
        return this.getPopularFallback(limit)
      }

      // Get products from the same category
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          basePrice: products.basePrice,
          thumbnailUrl: products.thumbnailUrl,
          slug: products.slug,
        })
        .from(products)
        .where(
          and(
            sql`${products.categoryId} = ${product[0].categoryId}`,
            eq(products.status, 'ACTIVE'),
            sql`${products.id} != ${productId}`
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)

      const recommendations: RecommendationResult[] = result.map((item, index) => ({
        productId: item.id,
        score: 0.9 - (index * 0.1), // High score for related products
        reason: 'Related Product'
      }))

      return {
        products: recommendations,
        total: recommendations.length
      }
    } catch (error) {
      console.error('Error getting related recommendations:', error)
      return this.getPopularFallback(limit)
    }
  }

  static async getByCategory(categoryId: string, limit: number = 12): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          basePrice: products.basePrice,
          thumbnailUrl: products.thumbnailUrl,
          slug: products.slug,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, categoryId),
            eq(products.status, 'ACTIVE')
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)

      const recommendations: RecommendationResult[] = result.map((item, index) => ({
        productId: item.id,
        score: 0.8 - (index * 0.05), // Medium score for category products
        reason: 'Category Product'
      }))

      return {
        products: recommendations,
        total: recommendations.length
      }
    } catch (error) {
      console.error('Error getting category recommendations:', error)
      return this.getPopularFallback(limit)
    }
  }

  static async getRecentlyViewed(productIds: string[], limit: number = 12): Promise<{ products: RecommendationResult[]; total: number }> {
    try {
      if (productIds.length === 0) {
        return { products: [], total: 0 }
      }

      const result = await db
        .select({
          id: products.id,
          name: products.name,
          basePrice: products.basePrice,
          thumbnailUrl: products.thumbnailUrl,
          slug: products.slug,
        })
        .from(products)
        .where(
          and(
            inArray(products.id, productIds),
            eq(products.status, 'ACTIVE')
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)

      const recommendations: RecommendationResult[] = result.map((item, index) => ({
        productId: item.id,
        score: 0.7 - (index * 0.05), // Lower score for recently viewed
        reason: 'Recently Viewed'
      }))

      return {
        products: recommendations,
        total: recommendations.length
      }
    } catch (error) {
      console.error('Error getting recently viewed recommendations:', error)
      return { products: [], total: 0 }
    }
  }
}

export const recommendationRepository = new RecommendationRepository()
