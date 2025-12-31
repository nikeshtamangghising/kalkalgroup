import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { InventoryRepository } from '@/lib/inventory-repository'
import { bulkInventoryUpdateSchema, inventoryAdjustmentSchema } from '@/lib/validations'

// GET /api/inventory - Get inventory summary and low stock alerts
export const GET = createAdminHandler(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const lowStockThreshold = parseInt(searchParams.get('threshold') || '10')

    // 1. Get Summary from new Refactored Repository
    const summary = await InventoryRepository.getInventorySummary(lowStockThreshold)

    // 2. Fetch all active products for detailed calculations (via Repository, not DB directly)
    const productsResult = await InventoryRepository.getAllActiveProducts() as any[]

    const totalInventoryWorth = productsResult.reduce((total, product) => {
      const price = parseFloat(product.price.toString())
      return total + (price * product.inventory)
    }, 0)

    // 3. Get recent delivered orders for turnover/sales data (via InventoryRepository, avoiding OrderRepo/Drizzle)
    const recentPurchasesRaw = await InventoryRepository.getRecentDeliveredOrders()

    // Transform orders into purchase history format
    const recentPurchases = recentPurchasesRaw
      .flatMap((order: any) => {
        return order.order_items.map((item: any) => ({
          id: `${order.id}-${item.id}`,
          productId: item.product_id,
          quantity: item.quantity,
          totalValue: (typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity,
          buyerName: order.user?.name || order.guest_name || 'Anonymous',
          buyerEmail: order.user?.email || order.guest_email || 'No email',
          createdAt: order.created_at,
          product: {
            id: item.products?.id || item.product_id,
            name: item.products?.name || 'Unknown',
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          }
        }))
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    // Calculate additional inventory metrics
    const totalProductsValue = productsResult.reduce((total, product) => {
      const price = parseFloat(product.price.toString())
      return total + (price * product.inventory)
    }, 0)

    const outOfStockCount = summary.outOfStockProducts.length
    const lowStockCount = summary.lowStockProducts.length

    // Calculate inventory turnover (simplified)
    const totalPurchasesValue = recentPurchases.reduce((total: number, purchase: any) => {
      return total + purchase.totalValue
    }, 0)

    const inventoryTurnover = totalProductsValue > 0 ? totalPurchasesValue / totalProductsValue : 0

    // Get category-wise inventory distribution
    const categoryDistribution = productsResult.reduce((acc, product) => {
      const category = 'Uncategorized' // Simplified as category name often needs join. 
      // If category name needed, Repo should fetch it. For now keeping simplified to Uncategorized or matching current logic.
      // Current logical fallback in original code was 'Uncategorized' too effectively if join wasn't actively used for grouping key.
      const price = parseFloat(product.price.toString())
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          value: 0,
          items: []
        }
      }
      acc[category].count += 1
      acc[category].value += price * product.inventory
      acc[category].items.push({
        id: product.id,
        name: product.name,
        inventory: product.inventory,
        price: parseFloat(product.price.toString()),
        value: price * product.inventory
      })
      return acc
    }, {} as Record<string, { count: number; value: number; items: any[] }>)

    // Get top selling products
    const productSales = recentPurchases.reduce((acc: any, purchase: any) => {
      if (!acc[purchase.productId]) {
        acc[purchase.productId] = {
          productId: purchase.productId,
          name: purchase.product.name,
          totalQuantity: 0,
          totalValue: 0,
          purchaseCount: 0
        }
      }
      acc[purchase.productId].totalQuantity += purchase.quantity
      acc[purchase.productId].totalValue += purchase.totalValue
      acc[purchase.productId].purchaseCount += 1
      return acc
    }, {} as Record<string, { productId: string; name: string; totalQuantity: number; totalValue: number; purchaseCount: number }>)

    const topSellingProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .slice(0, 10)

    const enhancedSummary = {
      ...summary,
      totalInventoryWorth,
      recentPurchases,
      totalProductsValue,
      outOfStockCount,
      lowStockCount,
      inventoryTurnover,
      categoryDistribution,
      topSellingProducts
    }

    return NextResponse.json(enhancedSummary)
  } catch (error) {
    console.error('Error fetching inventory summary:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

// PUT /api/inventory/bulk - Bulk update inventory levels
export const PUT = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const validationResult = bulkInventoryUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    // Transform validated data to match repository interface
    const updates = validationResult.data.updates.map(update => ({
      productId: update.productId,
      quantity: update.quantity
    }))

    const result = await InventoryRepository.bulkUpdateInventory(
      updates,
      validationResult.data.reason || 'Bulk inventory adjustment'
    )

    return NextResponse.json({
      message: `Successfully updated ${result.updatedCount} products`,
      ...result
    })
  } catch (error) {
    console.error('Error fetching inventory summary:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

// POST /api/inventory/adjust - Make individual inventory adjustments
export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const validationResult = inventoryAdjustmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    // Transform validated data to match repository interface
    const adjustmentData = {
      productId: validationResult.data.productId,
      quantity: validationResult.data.quantity,
      type: validationResult.data.type,
      reason: validationResult.data.reason,
      createdBy: validationResult.data.createdBy
    }

    const result = await InventoryRepository.adjustInventory(
      adjustmentData.productId,
      adjustmentData.quantity,
      adjustmentData.reason
    )

    return NextResponse.json({
      message: 'Inventory adjusted successfully',
      adjustment: result
    })
  } catch (error) {

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.error('Error fetching inventory summary:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})