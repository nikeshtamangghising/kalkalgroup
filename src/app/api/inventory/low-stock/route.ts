import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { InventoryRepository } from '@/lib/inventory-repository'

export const GET = createAdminHandler(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const lowStockProducts = await InventoryRepository.getLowStockProducts(limit)

    return NextResponse.json({
      data: lowStockProducts,
      count: lowStockProducts.length
    })
  } catch (error) {
    console.error('Low stock API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch low stock products' },
      { status: 500 }
    )
  }
})
