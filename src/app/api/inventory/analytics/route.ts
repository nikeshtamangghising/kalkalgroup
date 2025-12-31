import { NextResponse } from 'next/server'
import { InventoryRepository } from '@/lib/inventory-repository'

export async function GET() {
  try {
    const productsList = await InventoryRepository.getAllActiveProducts() as any[]

    const totalProducts = productsList.length

    const totalInventoryValue = productsList.reduce((acc, product) => {
      const price = typeof product.price === 'number' ? product.price : 0
      const inventory = product.inventory ?? 0
      return acc + price * inventory
    }, 0)

    const totalInventoryUnits = productsList.reduce((acc, product) => {
      const inventory = product.inventory ?? 0
      return acc + inventory
    }, 0)

    const outOfStockProducts = productsList.filter(
      (product) => (product.inventory ?? 0) === 0,
    )

    const lowStockProducts = productsList.filter((product) => {
      const inventory = product.inventory ?? 0
      const threshold = product.lowStockThreshold ?? 0
      return inventory > 0 && inventory <= threshold
    })

    return NextResponse.json({
      totalProducts,
      totalInventoryValue,
      totalInventoryUnits,
      outOfStockProducts: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.length,
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
