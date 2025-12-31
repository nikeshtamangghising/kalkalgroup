import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, orders } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createAdminHandler } from '@/lib/auth-middleware'

interface RouteContext {
  params: Promise<{ 
    id: string
  }>
}

export const GET = createAdminHandler(async (
  _request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // Get user data
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    const user = userResult[0]

    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get user's orders
    const userOrders = await db
      .select({
        id: orders.id,
        grandTotal: orders.grandTotal,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))

    const totalOrders = userOrders.length
    const totalSpent = userOrders.reduce((sum, o) => {
      const orderTotal = parseFloat(o.grandTotal?.toString() || '0')
      return sum + orderTotal
    }, 0)
    const lastOrder = userOrders[0] || null

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt.toISOString(),
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt ? lastOrder.createdAt.toISOString() : null,
      role: user.role,
      orders: userOrders.map(o => ({
        id: o.id,
        total: o.grandTotal,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
})