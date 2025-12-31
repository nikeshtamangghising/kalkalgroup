import 'server-only'
import { db } from '@/lib/db'
import { products, categories, brands } from './db/schema'
import { eq, and, or, desc, sql, ilike, gte, lte } from 'drizzle-orm'
import type {
  Product,
  PaginatedResponse,
} from '@/types'
import {
  invalidateProduct,
  invalidateProducts
} from './cache'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary for image cleanup
if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL)
  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
  })
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export class ProductRepository {
  static async incrementViewCount(productId: string): Promise<void> {
    try {
      // TODO: Implement actual view counting
      // For now, this is a no-op
      console.log(`Incrementing view count for product: ${productId}`)
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  // Factory function for compatibility
  static getProductRepository() {
    return new ProductRepository()
  }

  private async isDatabaseAvailable(): Promise<void> {
    // db is required - will throw error if DATABASE_URL is not set
    
    try {
      await db.select().from(products).limit(1)
    } catch (error) {
      throw new Error('Database connection failed')
    }
  }

  async create(data: any): Promise<Product> {
    await this.isDatabaseAvailable()

    const dbData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      status: 'PUBLISHED',
      brandId: data.brandId,
      categoryId: data.categoryId,
      thumbnailUrl: data.images?.[0] || null,
      basePrice: data.price,
      currency: data.currency || 'NPR',
      seoTitle: data.name,
      seoDescription: data.shortDescription,
      tags: data.tags || [],
    };

    const [inserted] = await db
      .insert(products)
      .values(dbData)
      .returning()
    
    // Invalidate cache
    await invalidateProducts()
    
    // Return product with relations
    const product = await this.findById(inserted.id)
    if (!product) {
      throw new Error('Failed to retrieve created product')
    }
    
    return product
  }

  async findById(id: string): Promise<Product | null> {
    await this.isDatabaseAvailable()

    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        thumbnailUrl: products.thumbnailUrl,
        images: products.images,
        basePrice: products.basePrice,
        currency: products.currency,
        inventory: products.inventory,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        tags: products.tags,
        attributes: products.attributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    return result[0] as unknown as Product || null
  }

  async findBySlug(slug: string): Promise<Product | null> {
    await this.isDatabaseAvailable()

    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        thumbnailUrl: products.thumbnailUrl,
        images: products.images,
        basePrice: products.basePrice,
        currency: products.currency,
        inventory: products.inventory,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        tags: products.tags,
        attributes: products.attributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1)

    return result[0] as unknown as Product || null
  }

  async findBySku(_sku: string): Promise<Product | null> {
    await this.isDatabaseAvailable()

    // Note: SKU would need to be added to the products schema
    // For now, return null as SKU is not in the current schema
    return null
  }

  async findMany(
    filters: any = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Product>> {
    await this.isDatabaseAvailable()

    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []
    
    if (filters.category) {
      whereConditions.push(eq(products.categoryId, filters.category))
    }
    
    if (filters.minPrice !== undefined) {
      whereConditions.push(gte(products.basePrice, filters.minPrice))
    }
    
    if (filters.maxPrice !== undefined) {
      whereConditions.push(lte(products.basePrice, filters.maxPrice))
    }
    
    if (filters.isActive !== undefined) {
      whereConditions.push(eq(products.status, filters.isActive ? 'ACTIVE' : 'DRAFT'))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(whereClause)

    // Get products
    const productResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        thumbnailUrl: products.thumbnailUrl,
        images: products.images,
        basePrice: products.basePrice,
        currency: products.currency,
        inventory: products.inventory,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        tags: products.tags,
        attributes: products.attributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
              })
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      data: productResults as unknown as Product[],
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    }
  }

  async update(id: string, data: any): Promise<Product> {
    await this.isDatabaseAvailable()

    // Get current product
    const currentProduct = await this.findById(id)
    if (!currentProduct) {
      throw new Error('Product not found')
    }

    const dbData: any = {
      updatedAt: new Date(),
    }

    if (data.name) dbData.name = data.name
    if (data.slug) dbData.slug = data.slug
    if (data.description) dbData.description = data.description
    if (data.shortDescription) dbData.shortDescription = data.shortDescription
    if (data.price !== undefined) dbData.basePrice = data.price
    if (data.currency) dbData.currency = data.currency
    if (data.categoryId) dbData.categoryId = data.categoryId
    if (data.brandId) dbData.brandId = data.brandId
    if (data.tags) dbData.tags = data.tags
    if (data.images && data.images.length > 0) {
      dbData.thumbnailUrl = data.images[0]
    }

    const [updated] = await db
      .update(products)
      .set(dbData)
      .where(eq(products.id, id))
      .returning()

    // Clean up old images if they changed
    if (data.images && currentProduct.thumbnailUrl && !data.images.includes(currentProduct.thumbnailUrl)) {
      try {
        const publicId = this.extractPublicIdFromUrl(currentProduct.thumbnailUrl)
        if (publicId) {
          await cloudinary.uploader.destroy(publicId)
        }
      } catch (error) {
        console.error('Failed to delete old image:', error)
      }
    }

    // Invalidate cache
    await invalidateProduct(id)
    await invalidateProducts()

    // Return updated product with relations
    const product = await this.findById(updated.id)
    if (!product) {
      throw new Error('Failed to retrieve updated product')
    }
    
    return product
  }

  async delete(id: string): Promise<boolean> {
    await this.isDatabaseAvailable()

    // Get current product to clean up images
    const currentProduct = await this.findById(id)
    
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning()

    // Clean up images
    if (currentProduct?.thumbnailUrl) {
      try {
        const publicId = this.extractPublicIdFromUrl(currentProduct.thumbnailUrl)
        if (publicId) {
          await cloudinary.uploader.destroy(publicId)
        }
      } catch (error) {
        console.error('Failed to delete product image:', error)
      }
    }

    // Invalidate cache
    await invalidateProduct(id)
    await invalidateProducts()

    return result.length > 0
  }

  static async searchProducts(
    query: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Product>> {
    try {
      await db.select().from(products).limit(1)
    } catch (error) {
      throw new Error('Database connection failed')
    }

    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const searchPattern = `%${query}%`
    const whereClause = or(
      ilike(products.name, searchPattern),
      ilike(products.description, searchPattern),
      ilike(products.slug, searchPattern)
    )

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .where(whereClause)

    // Get products
    const productResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        status: products.status,
        brandId: products.brandId,
        categoryId: products.categoryId,
        thumbnailUrl: products.thumbnailUrl,
        images: products.images,
        basePrice: products.basePrice,
        currency: products.currency,
        inventory: products.inventory,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        tags: products.tags,
        attributes: products.attributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
              })
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      data: productResults as any,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    }
  }

  // Additional methods for homepage API
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          status: products.status,
          brandId: products.brandId,
          categoryId: products.categoryId,
          thumbnailUrl: products.thumbnailUrl,
          images: products.images,
          basePrice: products.basePrice,
          currency: products.currency,
          inventory: products.inventory,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          isNewArrival: products.isNewArrival,
          tags: products.tags,
          attributes: products.attributes,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: categories,
          brand: brands,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(desc(products.createdAt))
        .limit(limit)

      return result as unknown as any[]
    } catch (error) {
      console.error('Failed to get featured products:', error)
      return []
    }
  }

  async getPopularProducts(limit: number = 6): Promise<Product[]> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          status: products.status,
          brandId: products.brandId,
          categoryId: products.categoryId,
          thumbnailUrl: products.thumbnailUrl,
          images: products.images,
          basePrice: products.basePrice,
          currency: products.currency,
          inventory: products.inventory,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          isNewArrival: products.isNewArrival,
          tags: products.tags,
          attributes: products.attributes,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: categories,
          brand: brands,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(desc(products.createdAt))
        .limit(limit)

      return result as unknown as any[]
    } catch (error) {
      console.error('Failed to get popular products:', error)
      return []
    }
  }

  async getNewArrivals(limit: number = 6): Promise<Product[]> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          status: products.status,
          brandId: products.brandId,
          categoryId: products.categoryId,
          thumbnailUrl: products.thumbnailUrl,
          images: products.images,
          basePrice: products.basePrice,
          currency: products.currency,
          inventory: products.inventory,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          isNewArrival: products.isNewArrival,
          tags: products.tags,
          attributes: products.attributes,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(desc(products.createdAt))
        .limit(limit)

      return result as unknown as any[]
    } catch (error) {
      console.error('Failed to get new arrivals:', error)
      return []
    }
  }

  async getRelatedProducts(productId: string, categoryId: string, limit: number = 5): Promise<Product[]> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          shortDescription: products.shortDescription,
          status: products.status,
          brandId: products.brandId,
          categoryId: products.categoryId,
          thumbnailUrl: products.thumbnailUrl,
          images: products.images,
          basePrice: products.basePrice,
          currency: products.currency,
          inventory: products.inventory,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          isNewArrival: products.isNewArrival,
          tags: products.tags,
          attributes: products.attributes,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, categoryId),
            eq(products.status, 'ACTIVE'),
            sql`${products.id} != ${productId}`
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)

      return result as unknown as any[]
    } catch (error) {
      console.error('Failed to get related products:', error)
      return []
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.name)

      return result as unknown as any[]
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  }

  private extractPublicIdFromUrl(imageUrl: string): string | null {
    if (!imageUrl) return null
    
    // Extract public ID from Cloudinary URL
    const matches = imageUrl.match(/\/v\d+\/(.+?)\.[a-z]+$/i)
    return matches ? matches[1] : null
  }
}

export const productRepository = new ProductRepository()
