import { NextRequest, NextResponse } from 'next/server'
import { categoryRepository } from '@/lib/category-repository'
import { createAdminHandler } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Use repository to get all categories (flat structure like brands)
    const categories = await categoryRepository.getAllFlat(includeInactive)

    return NextResponse.json({
      categories,
      total: categories.length
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST method for creating categories
export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, parent_id, metaTitle, metaDescription, image } = body

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (!slug) {
      return NextResponse.json(
        { error: 'Could not generate valid slug from name' },
        { status: 400 }
      )
    }

    try {
      const category = await categoryRepository.create({
        name,
        description,
        parent_id: parent_id || undefined,
        metaTitle,
        metaDescription,
        image
      })

      return NextResponse.json(
        {
          message: 'Category created successfully',
          category
        },
        { status: 201 }
      )
    } catch (e: any) {
      // Catch unique violation if repository throws it clearly, or generic error
      if (e.message && (e.message.includes('unique') || e.message.includes('duplicate'))) {
        return NextResponse.json(
          { error: 'A category with this name or slug already exists' },
          { status: 400 }
        )
      }
      throw e
    }

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
