import { NextRequest, NextResponse } from 'next/server'
import { GalleryRepository } from '@/lib/gallery-repository-simple'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// PUT /api/gallery/[id]/status - Update gallery item active status
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    const updatedItem = await GalleryRepository.update(id, { isActive })

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: `Gallery item ${isActive ? 'activated' : 'deactivated'} successfully`,
      source: 'database'
    })
  } catch (error) {
    console.error('[Gallery API] Error updating gallery item status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery item status' },
      { status: 500 }
    )
  }
}
