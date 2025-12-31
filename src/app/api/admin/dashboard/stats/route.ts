import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { eq, gte, lt, sql, and } from 'drizzle-orm'

type OrderSummary = {
  total: number | string | null
  status?: string | null
}

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // Get current date and 30 days ago for comparison
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Initialize with default values
    let totalRevenue = 0
    let totalOrders = 0
    let currentProductCount = 0
    let previousProductCount = 0
    let currentCustomerCount = 0
    let previousCustomerCount = 0
    let previousRevenue = 0
    let previousOrderCount = 0
    let ordersByStatus: any[] = []

    // Get current period orders (last 30 days) - with error handling
    try {
      const currentOrders = await db
        .select({
          total: orders.grandTotal,
          status: orders.status,
          createdAt: orders.createdAt
        })
        .from(orders)
        .where(gte(orders.createdAt, thirtyDaysAgo))

      totalRevenue = currentOrders.reduce((sum: number, order: OrderSummary) => {
        const numericTotal = parseFloat(String(order.total ?? '0'))
        return sum + (isNaN(numericTotal) ? 0 : numericTotal)
      }, 0)
      totalOrders = currentOrders.length

      // Calculate orders by status
      ordersByStatus = currentOrders.reduce((acc: any[], order: OrderSummary) => {
        const existing = acc.find(item => item.status === order.status)
        if (existing) {
          existing.count++
        } else {
          acc.push({ status: order.status, count: 1 })
        }
        return acc
      }, [])
    } catch (err) {
      console.error('Error fetching current orders:', err)
    }

    // Get previous period orders - with error handling
    try {
      const previousOrders = await db
        .select({
          total: orders.grandTotal
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, sixtyDaysAgo),
            lt(orders.createdAt, thirtyDaysAgo)
          )
        )

      previousRevenue = previousOrders.reduce((sum: number, order: OrderSummary) => {
        const numericTotal = parseFloat(String(order.total ?? '0'))
        return sum + (isNaN(numericTotal) ? 0 : numericTotal)
      }, 0)
      previousOrderCount = previousOrders.length
    } catch (err) {
      console.error('Error fetching previous orders:', err)
    }

    // Get product counts - with error handling
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(products)
        .where(eq(products.status, 'ACTIVE'))

      currentProductCount = Number(count) || 0
    } catch (err) {
      console.error('Error fetching product count:', err)
    }

    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(products)
        .where(
          and(
            eq(products.status, 'ACTIVE'),
            lt(products.createdAt, thirtyDaysAgo)
          )
        )

      previousProductCount = Number(count) || 0
    } catch (err) {
      console.error('Error fetching previous product count:', err)
    }

    // Get customer counts - with error handling
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.role, 'CUSTOMER'))

      currentCustomerCount = Number(count) || 0
    } catch (err) {
      console.error('Error fetching customer count:', err)
    }

    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(
          and(
            eq(users.role, 'CUSTOMER'),
            lt(users.createdAt, thirtyDaysAgo)
          )
        )

      previousCustomerCount = Number(count) || 0
    } catch (err) {
      console.error('Error fetching previous customer count:', err)
    }

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const stats = {
      totalRevenue,
      totalOrders,
      totalCustomers: currentCustomerCount,
      totalProducts: currentProductCount,
      revenueChange: calculateChange(totalRevenue, previousRevenue),
      ordersChange: calculateChange(totalOrders, previousOrderCount),
      customersChange: calculateChange(currentCustomerCount, previousCustomerCount),
      productsChange: calculateChange(currentProductCount, previousProductCount),
      ordersByStatus,
      averageOrderValue,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    // Return default stats instead of error to prevent dashboard crash
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 1,
      totalProducts: 0,
      revenueChange: 0,
      ordersChange: 0,
      customersChange: 0,
      productsChange: 0,
      ordersByStatus: [],
      averageOrderValue: 0,
    })
  }
}