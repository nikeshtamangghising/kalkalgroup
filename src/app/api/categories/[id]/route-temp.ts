import { NextResponse } from 'next/server'
import { categoryRepository } from '@/lib/category-repository'
import { createAdminAPIRoute } from '@/lib/backend/middleware/api-wrapper'

export const GET = createAdminAPIRoute(
  async (_request, { query }) => {
    const { id } = (query || {}) as { id: string }
    
    const category = await categoryRepository.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  },
  {
    rateLimit: 'admin'
  }
)

export const PUT = createAdminAPIRoute(
  async (request, { query }) => {
    const { id } = (query || {}) as { id: string }
    const body = await request.json()
    
    const updatedCategory = await categoryRepository.update(id, body)
    
    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory
    })
  },
  {
    rateLimit: 'admin'
  }
)

export const DELETE = createAdminAPIRoute(
  async (_request, { query }) => {
    const { id } = (query || {}) as { id: string }
    
    const deletedCategory = await categoryRepository.delete(id)
    
    return NextResponse.json({
      message: 'Category deleted successfully',
      category: deletedCategory
    })
  },
  {
    rateLimit: 'admin'
  }
)
