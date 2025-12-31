import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, and, or, ne, sql } from 'drizzle-orm'
import { createAdminHandler } from '@/lib/auth-middleware'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params
  try {

    // Get basic category info without relations first
    const categoryResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
    
    const category = categoryResult[0]

    if (category) {
      // Get product count and children count
      const [productCount, childrenCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.categoryId, id)),
        db.select({ count: sql<number>`count(*)` })
          .from(categories)
          .where(eq(categories.parentId, id))
      ])

      // Get parent info if exists
      let parent = null
      if (category.parentId) {
        const parentResult = await db.select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(eq(categories.id, category.parentId))
          .limit(1)
        parent = parentResult[0] || null
      }

      // Add counts to category object
      const categoryWithCounts = {
        ...category,
        parent,
        _count: {
          products: Number(productCount[0]?.count || 0),
          children: Number(childrenCount[0]?.count || 0)
        }
      }
      return NextResponse.json(categoryWithCounts)
    }

    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('GET category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = createAdminHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {

    const body = await request.json()
    
    const { name, slug, description, parentId, isActive, sortOrder } = body

    // Basic validation
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategoryResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
    const existingCategory = existingCategoryResult[0] || null

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if name or slug conflicts with other categories
    const conflictingCategoryResult = await db.select()
      .from(categories)
      .where(
        and(
          ne(categories.id, id),
          or(
            eq(categories.name, name),
            eq(categories.slug, slug)
          )
        )
      )
      .limit(1)
    const conflictingCategory = conflictingCategoryResult[0] || null

    if (conflictingCategory) {
      return NextResponse.json(
        { error: 'A category with this name or slug already exists' },
        { status: 400 }
      )
    }

    // If parentId is provided, check if parent exists and prevent circular reference
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        )
      }

      const parentCategoryResult = await db.select()
        .from(categories)
        .where(eq(categories.id, parentId))
        .limit(1)
      const parentCategory = parentCategoryResult[0] || null

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }

      // Check for circular reference (if parent's parent chain includes this category)
      let currentParentId = parentCategory.parentId
      while (currentParentId) {
        if (currentParentId === id) {
          return NextResponse.json(
            { error: 'This would create a circular reference' },
            { status: 400 }
          )
        }
        
        const parentOfParentResult = await db.select({ parentId: categories.parentId })
          .from(categories)
          .where(eq(categories.id, currentParentId))
          .limit(1)
        const parentOfParent = parentOfParentResult[0]
        
        currentParentId = parentOfParent?.parentId || null
      }
    }

    const [updatedCategory] = await db.update(categories)
      .set({
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
        imageUrl: null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? existingCategory.sortOrder,
        updatedAt: new Date()
      })
      .where(eq(categories.id, id))
      .returning()

    // Get related data
    const categoryWithRelations = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    // Get counts
    const [productCount, childrenCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.categoryId, id)),
      db.select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(eq(categories.parentId, id))
    ])

    const categoryWithCounts = {
      ...updatedCategory,
      parent: categoryWithRelations?.[0] || null,
      _count: {
        products: Number(productCount[0]?.count || 0),
        children: Number(childrenCount[0]?.count || 0)
      }
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category: categoryWithCounts
    })

  } catch (error) {
    console.error('PUT category error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = createAdminHandler(async (
  _request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {

    // Check if category exists and has products or children
    const categoryResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
    const categoryToDelete = categoryResult[0] || null

    if (!categoryToDelete) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Get counts
    const [productCount, childrenCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.categoryId, id)),
      db.select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(eq(categories.parentId, id))
    ])

    const productCountNum = Number(productCount[0]?.count || 0)
    const childrenCountNum = Number(childrenCount[0]?.count || 0)

    if (productCountNum > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products. Move products to another category first.' },
        { status: 400 }
      )
    }

    if (childrenCountNum > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Delete or move child categories first.' },
        { status: 400 }
      )
    }

    // Safe to delete
    const [deletedCategory] = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning()

    return NextResponse.json({
      message: 'Category deleted successfully',
      category: deletedCategory
    })

  } catch (error) {
    console.error('DELETE category error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})