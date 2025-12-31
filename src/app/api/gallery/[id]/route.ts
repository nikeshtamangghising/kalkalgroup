import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GalleryRepository, type UpdateGalleryItem } from '@/lib/gallery-repository-simple'

// Validation schema for gallery updates
const updateGallerySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  altText: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
  imageUrl: z.string().url().optional().nullable(),
})

// GET /api/gallery/[id] - Get single gallery item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const item = await GalleryRepository.getById(id)

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
      source: 'database'
    })
  } catch (error) {
    console.error('[Gallery API] Error fetching gallery item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery item' },
      { status: 500 }
    )
  }
}

// PUT /api/gallery/[id] - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const validatedData = updateGallerySchema.parse(body)

    // Normalize payload to match UpdateGalleryItem type (avoid null imageUrl)
    const { imageUrl, ...rest } = validatedData
    const updatePayload: UpdateGalleryItem = {
      ...rest,
      ...(imageUrl ? { imageUrl } : {}),
    }

    const updatedItem = await GalleryRepository.update(id, updatePayload)

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Gallery item updated successfully',
      source: 'database'
    })
  } catch (error) {
    console.error('[Gallery API] Error updating gallery item:', error)
    
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
      { success: false, error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}

// DELETE /api/gallery/[id] - Delete gallery item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if item exists using repository
      const existingItem = await GalleryRepository.getById(id)

      if (!existingItem) {
        return NextResponse.json(
          { success: false, error: 'Gallery item not found' },
          { status: 404 }
        )
      }

      await GalleryRepository.delete(id)

      return NextResponse.json({
        success: true,
        message: 'Gallery item deleted successfully',
        source: 'database'
      })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}