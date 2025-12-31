import 'server-only'
import { db } from '@/lib/db'
import { gallery } from '@/lib/db/schema'
import { eq, desc, asc, and } from 'drizzle-orm'

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  category: string
  imageUrl: string
  cloudinaryPublicId: string
  altText: string | null
  isActive: boolean
  sortOrder: number
  tags: string[]
  metadata: any
  createdAt: Date
  updatedAt: Date
}

export interface CreateGalleryItem {
  title: string
  description?: string | null
  category: string
  imageFile: File
  altText?: string | null
  tags?: string[]
  metadata?: any
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateGalleryItem {
  title?: string
  description?: string | null
  category?: string
  imageUrl?: string
  altText?: string | null
  isActive?: boolean
  sortOrder?: number
}

export class GalleryRepository {
  // Helper function to delete image from Cloudinary
  private static async deleteCloudinaryImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return // Not a Cloudinary image
    }

    try {
      // Extract public_id from Cloudinary URL
      const urlParts = imageUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split('.')[0]

      if (publicId) {
        const { CloudinaryService } = await import('@/lib/cloudinary')
        await CloudinaryService.deleteImage(publicId)
        console.log(`[GalleryRepository] Deleted Cloudinary image: ${publicId}`)
      }
    } catch (error) {
      console.error('[GalleryRepository] Failed to delete Cloudinary image', error)
      // Don't throw - image cleanup failure shouldn't break the operation
    }
  }

  /**
   * Get all gallery items with optional filtering
   */
  static async getAll(options?: {
    category?: string | null
    activeOnly?: boolean
    limit?: number
    offset?: number
  }): Promise<GalleryItem[]> {
    try {
      const whereConditions = []
      
      if (options?.activeOnly) {
        whereConditions.push(eq(gallery.isActive, true))
      }
      
      if (options?.category && options.category !== 'all') {
        whereConditions.push(eq(gallery.category, options.category))
      }

      const query = db.select().from(gallery)
      
      const finalQuery = whereConditions.length > 0
        ? query.where(and(...whereConditions))
        : query

      const orderedQuery = finalQuery.orderBy(asc(gallery.sortOrder), desc(gallery.createdAt))

      const limitedQuery = options?.limit 
        ? orderedQuery.limit(options.limit)
        : orderedQuery

      const offsetQuery = options?.offset
        ? limitedQuery.offset(options.offset)
        : limitedQuery

      const result = await offsetQuery

      console.log(`[GalleryRepository] Retrieved ${result.length} items from database`)
      return result as unknown as GalleryItem[]
    } catch (error) {
      console.error('[GalleryRepository] Error fetching gallery items', error)
      throw new Error(`Failed to fetch gallery items: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get gallery item by ID
   */
  static async getById(id: string): Promise<GalleryItem | null> {
    try {
      const result = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1)
      
      if (result.length === 0) {
        return null
      }
      
      return result[0] as unknown as GalleryItem
    } catch (error) {
      console.error('[GalleryRepository] Error fetching gallery item', error)
      throw new Error(`Failed to fetch gallery item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create new gallery item
   */
  static async create(data: CreateGalleryItem): Promise<GalleryItem> {
    try {
      // First upload image to Cloudinary
      const { CloudinaryService } = await import('@/lib/cloudinary')
      const uploadResult = await CloudinaryService.uploadImage(data.imageFile)
      
      const insertData = {
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        imageUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        altText: data.altText ?? data.title ?? null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        tags: data.tags ?? [],
        metadata: data.metadata ?? {},
      }

      console.log('[GalleryRepository] Creating gallery item', insertData)

      const result = await db.insert(gallery).values(insertData).returning()
      const newItem = result[0]

      if (!newItem) {
        throw new Error('No data returned after insert')
      }

      console.log('[GalleryRepository] Gallery item created successfully', { id: newItem.id })
      return newItem as GalleryItem
    } catch (error) {
      console.error('[GalleryRepository] Error creating gallery item', error)
      throw new Error(`Failed to create gallery item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update gallery item
   */
  static async update(id: string, data: UpdateGalleryItem): Promise<GalleryItem | null> {
    try {
      // Get current item to check for image changes
      const currentItem = await this.getById(id)
      if (!currentItem) {
        return null
      }

      const updateData: any = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.category !== undefined) updateData.category = data.category
      if (data.imageUrl !== undefined) {
        // Delete old image if it's being replaced
        if (currentItem.imageUrl && currentItem.imageUrl !== data.imageUrl) {
          await this.deleteCloudinaryImage(currentItem.imageUrl);
        }
        updateData.imageUrl = data.imageUrl
      }
      if (data.altText !== undefined) updateData.altText = data.altText
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
      updateData.updatedAt = new Date().toISOString()

      console.log('[GalleryRepository] Updating gallery item', { id, updateData })

      const result = await db
        .update(gallery)
        .set(updateData)
        .where(eq(gallery.id, id))
        .returning()
      
      if (result.length === 0) {
        return null
      }

      console.log('[GalleryRepository] Gallery item updated successfully', { id })
      return result[0] as unknown as GalleryItem
    } catch (error) {
      console.error('[GalleryRepository] Error updating gallery item', error)
      throw new Error(`Failed to update gallery item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete gallery item
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // Get current item to clean up image
      const currentItem = await this.getById(id)
      if (!currentItem) {
        return false
      }

      console.log('[GalleryRepository] Deleting gallery item', { id })

      const result = await db.delete(gallery).where(eq(gallery.id, id)).returning()
      
      if (result.length === 0) {
        return false
      }

      // Clean up associated image from Cloudinary
      if (currentItem.imageUrl) {
        await this.deleteCloudinaryImage(currentItem.imageUrl);
      }

      console.log('[GalleryRepository] Gallery item deleted successfully', { id })
      return true
    } catch (error) {
      console.error('[GalleryRepository] Error deleting gallery item', error)
      throw new Error(`Failed to delete gallery item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get gallery categories with counts
   */
  static async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const items = await this.getAll({ activeOnly: true })
    const categoryMap = new Map<string, number>()

    items.forEach(item => {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1)
    })

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }))
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id: string): Promise<GalleryItem | null> {
    const item = await this.getById(id)
    if (!item) return null

    return await this.update(id, { isActive: !item.isActive })
  }
}
