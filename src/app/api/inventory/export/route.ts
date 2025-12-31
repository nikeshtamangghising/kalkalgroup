import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { InventoryRepository } from '@/lib/inventory-repository'

export const GET = createAdminHandler(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'lowStock').toLowerCase()
    const threshold = parseInt(searchParams.get('threshold') || '10')

    // Fetch all active products via inventory repository
    const allProducts = await InventoryRepository.getAllActiveProducts() as any[]

    let productList: any[] = []

    if (type === 'lowstock') {
      productList = allProducts
        .filter(p => {
          const inventory = p.inventory ?? 0
          const lowStockThreshold = p.lowStockThreshold ?? threshold
          return inventory > 0 && inventory <= lowStockThreshold
        })
        .sort((a, b) => (a.inventory ?? 0) - (b.inventory ?? 0))
    } else if (type === 'outofstock') {
      productList = allProducts
        .filter(p => (p.inventory ?? 0) <= 0)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else {
      productList = allProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    const headers = ['id','name','sku','inventory','lowStockThreshold','price','category']
    const rows = productList.map(p => [
      p.id,
      p.name,
      p.sku || '',
      String(p.inventory ?? 0),
      String(p.lowStockThreshold ?? 0),
      String(p.price ?? 0),
      'Uncategorized'
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory_${type}_${Date.now()}.csv"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export inventory' }, { status: 500 })
  }
})
