import 'server-only'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, and, or, isNull, like, sql, asc } from 'drizzle-orm'
import { Category } from '@/types'
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

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  parent?: CategoryWithChildren;
  _count?: {
    products: number;
    children: number;
  };
  // Keeping these for compatibility with existing UI code if it expects them directly
  childCategories?: CategoryWithChildren[];
  parentCategory?: CategoryWithChildren;
}

class CategoryRepository {
  private static dbStatusCache: {
    available: boolean
    checkedAt: number
  } | null = null

  private readonly dbRetryInterval = parseInt(process.env.CATEGORY_DB_RETRY_INTERVAL || '60000') // 60s

  private mapToCategory(data: any): CategoryWithChildren {
    return {
      ...data,
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId || data.parent_id || null,
      metaTitle: data.metaTitle || data.meta_title || data.name,
      metaDescription: data.metaDescription || data.meta_description || data.description || `Shop ${data.name.toLowerCase()} products`,
      image: data.imageUrl || data.image_url || null,
      isActive: data.isActive ?? (data.is_active ?? true),
      sortOrder: data.sortOrder || data.sort_order || 0,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
      children: [],
      childCategories: []
    } as CategoryWithChildren;
  }

  private async isDatabaseAvailable(forceRefresh: boolean = false): Promise<boolean> {
    if (!forceRefresh && CategoryRepository.dbStatusCache) {
      const elapsed = Date.now() - CategoryRepository.dbStatusCache.checkedAt
      if (elapsed < this.dbRetryInterval) {
        return CategoryRepository.dbStatusCache.available
      }
    }

    try {
      await db.select({ id: categories.id }).from(categories).limit(1)
      CategoryRepository.dbStatusCache = { available: true, checkedAt: Date.now() }
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[CategoryRepository] Database not available:', message)
      CategoryRepository.dbStatusCache = { available: false, checkedAt: Date.now() }
      throw new Error(`Database connection failed: ${message}`)
    }
  }

  // Helper function to delete image from Cloudinary
  private async deleteCloudinaryImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return // Not a Cloudinary image
    }

    try {
      // Extract public_id from Cloudinary URL
      const urlParts = imageUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split('.')[0]

      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
        console.log(`[CategoryRepository] Deleted Cloudinary image: ${publicId}`)
      }
    } catch (error) {
      console.error('[CategoryRepository] Failed to delete Cloudinary image:', error)
      // Don't throw - image cleanup failure shouldn't break the operation
    }
  }

  // Get all root categories (no parent) with their children
  async getRootCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
    await this.isDatabaseAvailable();

    // Fetch all active categories
    const allCategories = await db.select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    if (!allCategories || allCategories.length === 0) {
      return []
    }

    const mappedCategories = allCategories.map(this.mapToCategory);
    const categoryMap = new Map<string, CategoryWithChildren>();

    mappedCategories.forEach(cat => {
      cat.children = [];
      cat.childCategories = [];
      categoryMap.set(cat.id, cat);
    });

    const rootCategories: CategoryWithChildren[] = [];

    mappedCategories.forEach(cat => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        parent.children!.push(cat);
        parent.childCategories!.push(cat);
      } else if (!cat.parentId) {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }

  // Get category by ID with full hierarchy info
  async findById(id: string): Promise<CategoryWithChildren | null> {
    await this.isDatabaseAvailable();

    const categoryResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!categoryResult || categoryResult.length === 0) {
      return null;
    }

    const category = this.mapToCategory(categoryResult[0]);

    // Fetch parent
    if (category.parentId) {
      const parentResult = await db.select()
        .from(categories)
        .where(eq(categories.id, category.parentId))
        .limit(1);
      if (parentResult.length > 0) {
        category.parent = this.mapToCategory(parentResult[0]);
        category.parentCategory = category.parent;
      }
    }

    // Fetch children
    const childrenData = await db.select()
      .from(categories)
      .where(and(
        eq(categories.parentId, category.id),
        eq(categories.isActive, true)
      ))
      .orderBy(asc(categories.sortOrder));

    if (childrenData.length > 0) {
      const children = childrenData.map(this.mapToCategory);
      category.children = children;
      category.childCategories = children;

      // Fill counts for children
      for (const child of children) {
        const productCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.categoryId, child.id));
        const productCount = Number(productCountResult[0]?.count || 0);

        const childCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(categories)
          .where(eq(categories.parentId, child.id));
        const childCount = Number(childCountResult[0]?.count || 0);

        child._count = {
          products: productCount,
          children: childCount
        };
      }
    }

    // Fill counts for self
    const productCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, category.id));
    const productCount = Number(productCountResult[0]?.count || 0);

    const childrenCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.parentId, category.id));
    const childrenCount = Number(childrenCountResult[0]?.count || 0);

    category._count = {
      products: productCount,
      children: childrenCount
    };

    return category;
  }

  // Get category by slug with full hierarchy info
  async findBySlug(slug: string): Promise<CategoryWithChildren | null> {
    await this.isDatabaseAvailable();

    const categoryResult = await db.select()
      .from(categories)
      .where(and(
        eq(categories.slug, slug),
        eq(categories.isActive, true)
      ))
      .limit(1);

    if (!categoryResult || categoryResult.length === 0) {
      return null;
    }

    const category = this.mapToCategory(categoryResult[0]);

    // Fetch parent
    if (category.parentId) {
      const parentResult = await db.select()
        .from(categories)
        .where(eq(categories.id, category.parentId))
        .limit(1);
      if (parentResult.length > 0) {
        category.parent = this.mapToCategory(parentResult[0]);
        category.parentCategory = category.parent;
      }
    }

    // Fetch children
    const childrenData = await db.select()
      .from(categories)
      .where(and(
        eq(categories.parentId, category.id),
        eq(categories.isActive, true)
      ))
      .orderBy(asc(categories.sortOrder));

    if (childrenData.length > 0) {
      const children = childrenData.map(this.mapToCategory);
      category.children = children;
      category.childCategories = children;

      // Fill counts for children
      for (const child of children) {
        const productCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.categoryId, child.id));
        const productCount = Number(productCountResult[0]?.count || 0);

        const childCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(categories)
          .where(eq(categories.parentId, child.id));
        const childCount = Number(childCountResult[0]?.count || 0);

        child._count = {
          products: productCount,
          children: childCount
        };
      }
    }

    // Fill counts for self
    const productCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, category.id));
    const productCount = Number(productCountResult[0]?.count || 0);

    const childrenCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.parentId, category.id));
    const childrenCount = Number(childrenCountResult[0]?.count || 0);

    category._count = {
      products: productCount,
      children: childrenCount
    };

    return category;
  }

  // Get category hierarchy path (breadcrumb)
  async getCategoryPath(categoryId: string): Promise<CategoryWithChildren[]> {
    await this.isDatabaseAvailable();

    const path: CategoryWithChildren[] = []
    let currentId: string | null = categoryId;

    // Safety break to prevent infinite loops in cyclic data
    let depth = 0;
    while (currentId && depth < 10) {
      const result = await db.select()
        .from(categories)
        .where(eq(categories.id, currentId))
        .limit(1);

      if (!result || result.length === 0) break;

      const cat = this.mapToCategory(result[0]);
      path.unshift(cat);

      currentId = cat.parentId || null;
      depth++;
      
      if (!currentId) break;
    }

    return path
  }

  // Get all categories as flat list (for admin/management)
  async getAllFlat(includeInactive: boolean = false): Promise<CategoryWithChildren[]> {
    await this.isDatabaseAvailable();

    const query = db.select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    const allCategories = includeInactive 
      ? await query
      : await db.select()
          .from(categories)
          .where(eq(categories.isActive, true))
          .orderBy(asc(categories.sortOrder));

    if (!allCategories || allCategories.length === 0) {
      return []
    }

    return allCategories.map(item => this.mapToCategory(item));
  }

  // Create new category with SEO-friendly slug
  async create(data: {
    name: string
    description?: string
    parent_id?: string
    metaTitle?: string
    metaDescription?: string
    image?: string
  }): Promise<CategoryWithChildren> {
    await this.isDatabaseAvailable();

    const slug = this.generateSlug(data.name)

    // Ensure slug is unique
    const existing = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Category with slug "${slug}" already exists`)
    }

    // Get next sort order
    const countQuery = data.parent_id
      ? db.select({ count: sql<number>`count(*)` })
          .from(categories)
          .where(eq(categories.parentId, data.parent_id))
      : db.select({ count: sql<number>`count(*)` })
          .from(categories)
          .where(isNull(categories.parentId));
    
    const countResult = await countQuery;
    const siblingCount = Number(countResult[0]?.count || 0);

    const [newCategory] = await db.insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description || null,
        parentId: data.parent_id || null,
        imageUrl: data.image || null,
        isActive: true,
        sortOrder: siblingCount
      })
      .returning();

    return this.mapToCategory(newCategory);
  }

  // Update category
  async update(id: string, data: Partial<{
    name: string
    description: string
    parent_id: string
    metaTitle: string
    metaDescription: string
    image: string
    isActive: boolean
    sortOrder: number
  }>): Promise<CategoryWithChildren> {
    await this.isDatabaseAvailable();

    // Get current category to check for image changes
    const currentCategory = await db.select({ imageUrl: categories.imageUrl })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then(results => results[0] || null);

    const updateData: any = { updatedAt: new Date() }

    if (data.name !== undefined) {
      updateData.name = data.name;
      // Update slug if name changes
      const newSlug = this.generateSlug(data.name)

      // Check conflict
      const conflict = await db.select({ id: categories.id })
        .from(categories)
        .where(and(
          eq(categories.slug, newSlug),
          sql`${categories.id} != ${id}`
        ))
        .limit(1);

      if (conflict.length > 0) {
        throw new Error(`Category with slug "${newSlug}" already exists`);
      }
      updateData.slug = newSlug;
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.parent_id !== undefined) updateData.parentId = data.parent_id;
    if (data.image !== undefined) {
      // Delete old image if it's being replaced
      if (currentCategory?.imageUrl && currentCategory.imageUrl !== data.image) {
        await this.deleteCloudinaryImage(currentCategory.imageUrl);
      }
      updateData.imageUrl = data.image;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const [updated] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      throw new Error('Category not found')
    }

    return this.mapToCategory(updated);
  }

  // Delete category (soft delete by setting isActive to false)
  async delete(id: string): Promise<CategoryWithChildren> {
    await this.isDatabaseAvailable();
    
    // Get current category to clean up image
    const currentCategory = await db.select({ imageUrl: categories.imageUrl })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then(results => results[0] || null);

    // Check for children
    const childCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(and(
        eq(categories.parentId, id),
        eq(categories.isActive, true)
      ));
    const childCount = Number(childCountResult[0]?.count || 0);

    if (childCount > 0) {
      throw new Error('Cannot delete category with active subcategories')
    }

    const productCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, id));
    const productCount = Number(productCountResult[0]?.count || 0);

    if (productCount > 0) {
      throw new Error('Cannot delete category with products. Move products first.')
    }

    // Delete associated image from Cloudinary
    if (currentCategory?.imageUrl) {
      await this.deleteCloudinaryImage(currentCategory.imageUrl);
    }

    const [updated] = await db.update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      throw new Error('Category not found')
    }

    return this.mapToCategory(updated);
  }

  // Generate SEO-friendly slug
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  // Get categories for navigation menu
  async getNavigationCategories(): Promise<CategoryWithChildren[]> {
    return this.getRootCategoriesWithChildren();
  }

  // Search categories
  async search(query: string): Promise<CategoryWithChildren[]> {
    await this.isDatabaseAvailable();

    const searchTerm = `%${query}%`;
    const results = await db.select()
      .from(categories)
      .where(and(
        eq(categories.isActive, true),
        or(
          like(categories.name, searchTerm),
          like(categories.description, searchTerm)
        )
      ))
      .orderBy(asc(categories.name));

    return results.map(item => this.mapToCategory(item));
  }
}

export const categoryRepository = new CategoryRepository()