import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { InventoryRepository } from '@/lib/inventory-repository'
import { inventoryAdjustmentSchema } from '@/lib/validations'

// POST /api/inventory/adjust - Make individual inventory adjustments
export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()

    const validationResult = inventoryAdjustmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 },
      )
    }

    // Transform validated data to match repository interface
    const adjustmentData = {
      productId: validationResult.data.productId,
      quantity: validationResult.data.quantity,
      type: validationResult.data.type,
      reason: validationResult.data.reason,
      createdBy: validationResult.data.createdBy,
    }

    const result = await InventoryRepository.adjustInventory(
      adjustmentData.productId,
      adjustmentData.quantity,
      adjustmentData.reason
    )

    return NextResponse.json({
      message: 'Inventory adjusted successfully',
      adjustment: result,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
})
