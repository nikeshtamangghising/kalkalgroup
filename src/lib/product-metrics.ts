import 'server-only'
import { db } from '@/lib/db'
import { orderItems, products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

// Recalculate product engagement metrics from source tables
// - viewCount: TODO: from user_activities (VIEW) when available
// - cartCount: from cart_items (sum of quantities per product)
// - orderCount: from order_items count per product (number of orders that include product)
// - purchaseCount: from order_items sum(quantity) per product

export async function recalculateAllProductMetrics(): Promise<void> {
  // 1) TODO: Aggregate views when userActivities table is available

  // 2) TODO: Aggregate carts when cart functionality is fully implemented

  // 3) Aggregate orders (count of orders containing product)
  const orderCounts = await db.select({
    productId: orderItems.productId,
    count: sql<number>`count(*)`.as('count')
  })
  .from(orderItems)
  .groupBy(orderItems.productId)

  // 5) Aggregate purchases (sum of quantities ordered)
  const purchases = await db.select({
    productId: orderItems.productId,
    sum: sql<number>`sum(${orderItems.quantity})`.as('sum')
  })
  .from(orderItems)
  .groupBy(orderItems.productId)

  // Build maps for quick lookup  
  const orderMap = Object.fromEntries(orderCounts.map(o => [o.productId, o.count]))
  const purchaseMap = Object.fromEntries(purchases.map(p => [p.productId, p.sum || 0]))

  // Get all product IDs to update
  const productsResult = await db.select({ id: products.id }).from(products)

  // Batch updates
  const updates = productsResult.map((p: any) => {
    const id = p.id
    return db.update(products).set({
      viewCount: 0, // TODO: implement when userActivities table is available
      orderCount: orderMap[id] || 0,
      purchaseCount: purchaseMap[id] || 0,
    }).where(eq(products.id, id))
  })

  // Execute updates in reasonable chunks to avoid overwhelming DB
  const chunkSize = 100
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize)
    // Execute each update individually since Drizzle doesn't have transaction support like Prisma
    for (const update of chunk) {
      await update
    }
  }
}
