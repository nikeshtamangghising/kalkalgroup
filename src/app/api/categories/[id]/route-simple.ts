import { NextRequest, NextResponse } from 'next/server'
import { categoryRepository } from '@/lib/category-repository'

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
    const category = await categoryRepository.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('GET category error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
