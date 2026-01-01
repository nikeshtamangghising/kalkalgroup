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

    // Handle category name to ID conversion
    let categoryId = data.categoryId
    if (data.category && typeof data.category === 'string') {
      // If category is a name, find the ID
      const category = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, data.category))
        .limit(1)
      
      if (category.length > 0) {
        categoryId = category[0].id
      }
    }

    // Handle brand name to ID conversion  
    let brandId = data.brandId
    if (data.brand && typeof data.brand === 'string') {
      // If brand is a name, find the ID
      const brand = await db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.name, data.brand))
        .limit(1)
      
      if (brand.length > 0) {
        brandId = brand[0].id
      }
    }

    const dbData = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: data.description || '',
      shortDescription: data.shortDescription || null,
      status: 'PUBLISHED',
      brandId: brandId || null,
      categoryId: categoryId || null,
      thumbnailUrl: data.images?.[0] || data.thumbnailUrl || null,
      images: data.images && Array.isArray(data.images) && data.images.length > 0 ? data.images : [],
      basePrice: data.price,
      price: data.discountPrice || null,
      discountPrice: data.discountPrice || null,
      purchasePrice: data.purchasePrice || null,
      currency: data.currency || 'NPR',
      tags: data.tags || [],
      sku: data.sku || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      isNewArrival: data.isNewArrival || false,
      inventory: data.stockQuantity || 0,
      lowStockThreshold: data.minStockLevel || 5,
      seoTitle: data.name,
      seoDescription: data.shortDescription || data.description?.substring(0, 160) || null,
      // Handle dimensions
      weight: data.weight ? data.weight.toString() : null,
      // Store dimensions as JSON in attributes or separate fields if they exist
      attributes: data.weight || data.length || data.width || data.height ? {
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        dimensions: {
          length: data.length,
          width: data.width,
          height: data.height
        }
      } : null,
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
        price: products.price,
        discountPrice: products.discountPrice,
        purchasePrice: products.purchasePrice,
        currency: products.currency,
        sku: products.sku,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        inventory: products.inventory,
        lowStockThreshold: products.lowStockThreshold,
        orderCount: products.orderCount,
        purchaseCount: products.purchaseCount,
        viewCount: products.viewCount,
        popularityScore: products.popularityScore,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        weight: products.weight,
        dimensions: products.dimensions,
        attributes: products.attributes,
        tags: products.tags,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Include related category data
        categoryName: categories.name,
        categoryDescription: categories.description,
        categorySlug: categories.slug,
        categoryIsActive: categories.isActive,
        categorySortOrder: categories.sortOrder,
        categoryCreatedAt: categories.createdAt,
        categoryUpdatedAt: categories.updatedAt,
        // Include related brand data
        brandName: brands.name,
        brandSlug: brands.slug,
        brandDescription: brands.description,
        brandLogoUrl: brands.logoUrl,
        brandWebsite: brands.website,
        brandIsActive: brands.isActive,
        brandCreatedAt: brands.createdAt,
        brandUpdatedAt: brands.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.id, id))
      .limit(1)

    if (result.length === 0) return null
    
    const row = result[0]
    
    // Construct the product object with nested category and brand
    const product: any = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.shortDescription,
      status: row.status,
      brandId: row.brandId,
      categoryId: row.categoryId,
      thumbnailUrl: row.thumbnailUrl,
      images: row.images,
      basePrice: row.basePrice,
      price: row.price,
      discountPrice: row.discountPrice,
      purchasePrice: row.purchasePrice,
      currency: row.currency,
      sku: row.sku,
      isActive: row.isActive,
      isFeatured: row.isFeatured,
      isNewArrival: row.isNewArrival,
      inventory: row.inventory,
      lowStockThreshold: row.lowStockThreshold,
      orderCount: row.orderCount,
      purchaseCount: row.purchaseCount,
      viewCount: row.viewCount,
      popularityScore: row.popularityScore,
      ratingAvg: row.ratingAvg,
      ratingCount: row.ratingCount,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      weight: row.weight,
      dimensions: row.dimensions,
      attributes: row.attributes,
      tags: row.tags,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // Add nested category object
      category: row.categoryName ? {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        slug: row.categorySlug,
        isActive: row.categoryIsActive,
        sortOrder: row.categorySortOrder,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt,
      } : null,
      // Add nested brand object
      brand: row.brandName ? {
        id: row.brandId,
        name: row.brandName,
        slug: row.brandSlug,
        description: row.brandDescription,
        logoUrl: row.brandLogoUrl,
        website: row.brandWebsite,
        isActive: row.brandIsActive,
        createdAt: row.brandCreatedAt,
        updatedAt: row.brandUpdatedAt,
      } : null,
    }
    
    return product as Product
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
        price: products.price,
        discountPrice: products.discountPrice,
        purchasePrice: products.purchasePrice,
        currency: products.currency,
        sku: products.sku,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        inventory: products.inventory,
        lowStockThreshold: products.lowStockThreshold,
        orderCount: products.orderCount,
        purchaseCount: products.purchaseCount,
        viewCount: products.viewCount,
        popularityScore: products.popularityScore,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        weight: products.weight,
        dimensions: products.dimensions,
        attributes: products.attributes,
        tags: products.tags,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Include related category data
        categoryName: categories.name,
        categoryDescription: categories.description,
        categorySlug: categories.slug,
        categoryIsActive: categories.isActive,
        categorySortOrder: categories.sortOrder,
        categoryCreatedAt: categories.createdAt,
        categoryUpdatedAt: categories.updatedAt,
        // Include related brand data
        brandName: brands.name,
        brandSlug: brands.slug,
        brandDescription: brands.description,
        brandLogoUrl: brands.logoUrl,
        brandWebsite: brands.website,
        brandIsActive: brands.isActive,
        brandCreatedAt: brands.createdAt,
        brandUpdatedAt: brands.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.slug, slug))
      .limit(1)

    if (result.length === 0) return null
    
    const row = result[0]
    
    // Construct the product object with nested category and brand
    const product: any = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.shortDescription,
      status: row.status,
      brandId: row.brandId,
      categoryId: row.categoryId,
      thumbnailUrl: row.thumbnailUrl,
      images: row.images,
      basePrice: row.basePrice,
      price: row.price,
      discountPrice: row.discountPrice,
      purchasePrice: row.purchasePrice,
      currency: row.currency,
      sku: row.sku,
      isActive: row.isActive,
      isFeatured: row.isFeatured,
      isNewArrival: row.isNewArrival,
      inventory: row.inventory,
      lowStockThreshold: row.lowStockThreshold,
      orderCount: row.orderCount,
      purchaseCount: row.purchaseCount,
      viewCount: row.viewCount,
      popularityScore: row.popularityScore,
      ratingAvg: row.ratingAvg,
      ratingCount: row.ratingCount,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      weight: row.weight,
      dimensions: row.dimensions,
      attributes: row.attributes,
      tags: row.tags,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // Add nested category object
      category: row.categoryName ? {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        slug: row.categorySlug,
        isActive: row.categoryIsActive,
        sortOrder: row.categorySortOrder,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt,
      } : null,
      // Add nested brand object
      brand: row.brandName ? {
        id: row.brandId,
        name: row.brandName,
        slug: row.brandSlug,
        description: row.brandDescription,
        logoUrl: row.brandLogoUrl,
        website: row.brandWebsite,
        isActive: row.brandIsActive,
        createdAt: row.brandCreatedAt,
        updatedAt: row.brandUpdatedAt,
      } : null,
    }
    
    return product as Product
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
      // Handle category by name or ID
      if (filters.category.length === 36 && filters.category.includes('-')) {
        // It's a UUID (category ID)
        whereConditions.push(eq(products.categoryId, filters.category))
      } else {
        // It's a category name, need to find the category by name
        const category = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.name, filters.category))
          .limit(1)
        
        if (category.length > 0) {
          whereConditions.push(eq(products.categoryId, category[0].id))
        }
      }
    }
    
    if (filters.minPrice !== undefined) {
      whereConditions.push(gte(products.basePrice, filters.minPrice))
    }
    
    if (filters.maxPrice !== undefined) {
      whereConditions.push(lte(products.basePrice, filters.maxPrice))
    }
    
    if (filters.isActive !== undefined) {
      whereConditions.push(eq(products.isActive, filters.isActive))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
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
        price: products.price,
        discountPrice: products.discountPrice,
        purchasePrice: products.purchasePrice,
        currency: products.currency,
        sku: products.sku,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        inventory: products.inventory,
        lowStockThreshold: products.lowStockThreshold,
        orderCount: products.orderCount,
        purchaseCount: products.purchaseCount,
        viewCount: products.viewCount,
        popularityScore: products.popularityScore,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        weight: products.weight,
        dimensions: products.dimensions,
        attributes: products.attributes,
        tags: products.tags,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Include related category data
        categoryName: categories.name,
        categoryDescription: categories.description,
        categorySlug: categories.slug,
        categoryIsActive: categories.isActive,
        categorySortOrder: categories.sortOrder,
        categoryCreatedAt: categories.createdAt,
        categoryUpdatedAt: categories.updatedAt,
        // Include related brand data
        brandName: brands.name,
        brandSlug: brands.slug,
        brandDescription: brands.description,
        brandLogoUrl: brands.logoUrl,
        brandWebsite: brands.website,
        brandIsActive: brands.isActive,
        brandCreatedAt: brands.createdAt,
        brandUpdatedAt: brands.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)

    // Process results to include nested category and brand objects
    const processedResults = productResults.map(row => {
      const product: any = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        shortDescription: row.shortDescription,
        status: row.status,
        brandId: row.brandId,
        categoryId: row.categoryId,
        thumbnailUrl: row.thumbnailUrl,
        images: row.images,
        basePrice: row.basePrice,
        price: row.price,
        discountPrice: row.discountPrice,
        purchasePrice: row.purchasePrice,
        currency: row.currency,
        sku: row.sku,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        isNewArrival: row.isNewArrival,
        inventory: row.inventory,
        lowStockThreshold: row.lowStockThreshold,
        orderCount: row.orderCount,
        purchaseCount: row.purchaseCount,
        viewCount: row.viewCount,
        popularityScore: row.popularityScore,
        ratingAvg: row.ratingAvg,
        ratingCount: row.ratingCount,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        weight: row.weight,
        dimensions: row.dimensions,
        attributes: row.attributes,
        tags: row.tags,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        // Add nested category object
        category: row.categoryName ? {
          id: row.categoryId,
          name: row.categoryName,
          description: row.categoryDescription,
          slug: row.categorySlug,
          isActive: row.categoryIsActive,
          sortOrder: row.categorySortOrder,
          createdAt: row.categoryCreatedAt,
          updatedAt: row.categoryUpdatedAt,
        } : null,
        // Add nested brand object
        brand: row.brandName ? {
          id: row.brandId,
          name: row.brandName,
          slug: row.brandSlug,
          description: row.brandDescription,
          logoUrl: row.brandLogoUrl,
          website: row.brandWebsite,
          isActive: row.brandIsActive,
          createdAt: row.brandCreatedAt,
          updatedAt: row.brandUpdatedAt,
        } : null,
      }
      
      return product as Product
    })

    return {
      data: processedResults,
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
    if (data.images && Array.isArray(data.images)) {
      dbData.images = data.images
      if (data.images.length > 0) {
        dbData.thumbnailUrl = data.images[0]
      }
    }
    
    // Handle dimensions - store as JSON in dimensions column
    if (data.dimensions) {
      dbData.dimensions = data.dimensions
    }
    
    // Handle length, width, height separately if provided (for backward compatibility)
    if (data.length || data.width || data.height) {
      const dimensions = dbData.dimensions || {}
      dimensions.length = data.length || dimensions.length
      dimensions.width = data.width || dimensions.width
      dimensions.height = data.height || dimensions.height
      dbData.dimensions = dimensions
    }

    const [updated] = await db
      .update(products)
      .set(dbData)
      .where(eq(products.id, id))
      .returning()

    // Clean up old images if they changed
    if (data.images && Array.isArray(data.images) && Array.isArray(currentProduct.images)) {
      // Find images to delete (in old array but not in new array)
      const imagesToDelete = currentProduct.images.filter(img => !data.images.includes(img));
      
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = this.extractPublicIdFromUrl(imageUrl)
          if (publicId) {
            await cloudinary.uploader.destroy(publicId)
          }
        } catch (error) {
          console.error('Failed to delete old image:', error)
        }
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
