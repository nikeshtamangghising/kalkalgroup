import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, orders } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createAdminHandler } from '@/lib/auth-middleware'

export const GET = createAdminHandler(async (_request: NextRequest) => {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }
    
    // Get customers with their orders using joins
    const customerData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        orderId: orders.id,
        orderGrandTotal: orders.grandTotal,
        orderCreatedAt: orders.createdAt,
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(eq(users.role, 'CUSTOMER'))
      .orderBy(desc(orders.createdAt));

    // Group orders by customer
    const customersMap = new Map();
    
    for (const row of customerData) {
      if (!customersMap.has(row.id)) {
        customersMap.set(row.id, {
          id: row.id,
          name: row.name,
          email: row.email,
          createdAt: row.createdAt,
          orders: []
        });
      }
      
      if (row.orderId) { // Only add order if it exists
        customersMap.get(row.id).orders.push({
          id: row.orderId,
          grandTotal: row.orderGrandTotal,
          createdAt: row.orderCreatedAt
        });
      }
    }
    
    const customers = Array.from(customersMap.values());

    // Build CSV
    const headers = [
      'id','name','email','joinedAt','totalOrders','totalSpent','lastOrderDate'
    ]

    const rows = customers.map((c: any) => {
      const totalOrders = c.orders?.length || 0
      const totalSpent = (c.orders || []).reduce((sum: number, o: any) => {
        const orderTotal = parseFloat(o.grandTotal?.toString() || '0')
        return sum + orderTotal
      }, 0)
      const lastOrder = c.orders && c.orders.length > 0 ? c.orders[0] : null
      return [
        c.id,
        c.name || '',
        c.email,
        c.createdAt.toISOString(),
        String(totalOrders),
        String(totalSpent),
        lastOrder ? lastOrder.createdAt.toISOString() : ''
      ]
    })

    const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers_export_${Date.now()}.csv"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export customers' }, { status: 500 })
  }
})