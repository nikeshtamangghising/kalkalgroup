import 'server-only'
import { db } from './db'
import { products, inventoryAdjustments } from './db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { PaginationParams, PaginatedResponse } from '@/types'

export interface LowStockProduct {
  id: string
  name: string
  sku?: string
  currentStock: number
  lowStockThreshold: number
  status: string
}

export class InventoryRepository {
  static async getAllActiveProducts(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          status: products.status,
          basePrice: products.basePrice,
        })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(products.name)

      // Add mock inventory data for now
      return result.map(product => ({
        ...product,
        inventory: Math.floor(Math.random() * 100), // Mock data
        lowStockThreshold: 5, // Default threshold
      }))
    } catch (error) {
      console.error('Failed to get active products:', error)
      return []
    }
  }

  static async bulkUpdateInventory(updates: any[], reason?: string): Promise<any> {
    try {
      let updatedCount = 0
      const errors: any[] = []
      
      for (const update of updates) {
        try {
          await InventoryRepository.adjustInventory(
            update.productId,
            update.quantity,
            reason
          )
          updatedCount++
        } catch (error) {
          errors.push({ productId: update.productId, error })
        }
      }
      
      return {
        updatedCount,
        errors,
        totalUpdates: updates.length
      }
    } catch (error) {
      console.error('Failed to bulk update inventory:', error)
      throw error
    }
  }

  static async getRecentDeliveredOrders(): Promise<any[]> {
    try {
      // TODO: Implement actual order fetching
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get recent delivered orders:', error)
      return []
    }
  }

  static async getInventorySummary(lowStockThreshold: number = 5): Promise<any> {
    try {
      const lowStockProducts = await this.getLowStockProducts(100)
      const activeProducts = await this.getAllActiveProducts()
      
      const totalInventoryValue = activeProducts.reduce((acc, product) => {
        const price = Number(product.basePrice || 0)
        const inventory = product.inventory || 0
        return acc + price * inventory
      }, 0)
      
      const totalInventoryUnits = activeProducts.reduce((acc, product) => {
        return acc + (product.inventory || 0)
      }, 0)
      
      return {
        totalProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        totalInventoryValue,
        totalInventoryUnits,
        lowStockThreshold
      }
    } catch (error) {
      console.error('Failed to get inventory summary:', error)
      return {
        totalProducts: 0,
        lowStockProducts: 0,
        totalInventoryValue: 0,
        totalInventoryUnits: 0,
        lowStockThreshold
      }
    }
  }

  static async getInventoryHistory(): Promise<any[]> {
    try {
      // TODO: Implement actual inventory history fetching
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get inventory history:', error)
      return []
    }
  }

  static async getLowStockProducts(limit: number = 50): Promise<LowStockProduct[]> {
    try {
      // Note: This is a simplified version since inventory is not in the current schema
      // In a real implementation, you would have an inventory field in the products table
      // or a separate inventory table
      
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          status: products.status,
        })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))
        .orderBy(desc(products.createdAt))
        .limit(limit)

      // Return mock low stock data for now
      // This would be replaced with actual inventory logic
      return result.map(product => ({
        ...product,
        sku: undefined, // SKU not in current schema
        currentStock: Math.floor(Math.random() * 20), // Mock data
        lowStockThreshold: 5, // Default threshold
      }))
    } catch (error) {
      console.error('Failed to get low stock products:', error)
      return []
    }
  }

  static async adjustInventory(
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<void> {
    try {
      await db.insert(inventoryAdjustments).values({
        productVariantId: productId, // Use productVariantId as required by schema
        quantityChange: quantity, // Use quantityChange as required by schema
        reason: reason || null,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error('Failed to adjust inventory:', error)
      throw error
    }
  }

  static async getInventoryAdjustments(
    productId?: string,
    pagination: PaginationParams = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page = 1, limit = 50 } = pagination
      const offset = (page - 1) * limit

      let whereClause = productId ? eq(inventoryAdjustments.productVariantId, productId) : undefined

      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(inventoryAdjustments)
        .where(whereClause || sql`1=1`)

      const adjustments = await db
        .select()
        .from(inventoryAdjustments)
        .where(whereClause || sql`1=1`)
        .orderBy(desc(inventoryAdjustments.createdAt))
        .limit(limit)
        .offset(offset)

      return {
        data: adjustments,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      }
    } catch (error) {
      console.error('Failed to get inventory adjustments:', error)
      return {
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      }
    }
  }
}

export const inventoryRepository = new InventoryRepository()
