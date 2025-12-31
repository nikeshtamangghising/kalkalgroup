import { NextRequest, NextResponse } from 'next/server'
import { GalleryRepository } from '@/lib/gallery-repository'
import { z } from 'zod'

export const runtime = 'nodejs'

// Validation schema for gallery items
const gallerySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  altText: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
})

// GET /api/gallery - Get all gallery items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    console.log('[Gallery API] GET request:', { category, activeOnly, limit, offset })

    const items = await GalleryRepository.getAll({
      category,
      activeOnly,
      limit,
      offset,
    })

    console.log('[Gallery API] Retrieved', items.length, 'items from database')

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      source: 'database'
    })
  } catch (error) {
    console.error('[Gallery API] Error in GET:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gallery items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/gallery - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const altText = formData.get('altText') as string
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {}
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      )
    }

    // Validate the data
    const validatedData = gallerySchema.parse({
      title,
      description,
      category,
      altText,
      tags,
      metadata,
    })

    console.log('[Gallery API] Creating gallery item:', validatedData.title)

    const newItem = await GalleryRepository.create({
      ...validatedData,
      imageFile,
    })

    console.log('[Gallery API] Gallery item created successfully:', newItem.id)

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Gallery item created successfully',
      source: 'database'
    })
  } catch (error) {
    console.error('[Gallery API] Error in POST:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create gallery item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

