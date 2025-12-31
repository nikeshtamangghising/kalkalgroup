import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateInvoicePDF } from '@/lib/invoice-generator'
import { db } from '@/lib/db'
import { orders, users, orderItems, products, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type InvoiceOrder = {
  id: string
  userId: string
  status: string
  total: number
  createdAt: Date
  stripePaymentIntentId: string | null
  user: {
    id: string
    name: string
    email: string
    createdAt: Date
    role: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      currency?: string
      category?: {
        name: string
      }
    }
  }>
  shippingAddress?: {
    fullName: string
    email?: string
    phone?: string
    address: string
    city: string
    postalCode: string
    country?: string
  } | null
}

const SAMPLE_INVOICE_ORDERS: Record<string, InvoiceOrder> = {
  'sample-order-1': {
    id: 'sample-order-1',
    userId: 'demo-user',
    status: 'DELIVERED',
    total: 18990,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    stripePaymentIntentId: 'pi_sample_123',
    user: {
      id: 'demo-user',
      name: 'Admin User',
      email: 'admin@kalkal.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      role: 'ADMIN',
    },
    items: [
      {
        id: 'sample-item-1',
        quantity: 1,
        price: 12990,
        product: {
          id: 'sample-product-ceramic',
          name: 'Artisan Ceramic Dinner Set',
          currency: 'NPR',
          category: { name: 'Dining' },
        },
      },
      {
        id: 'sample-item-2',
        quantity: 1,
        price: 6000,
        product: {
          id: 'sample-product-cutlery',
          name: 'Matte Black Cutlery Set',
          currency: 'NPR',
          category: { name: 'Accessories' },
        },
      },
    ],
    shippingAddress: {
      fullName: 'Admin User',
      email: 'admin@kalkal.com',
      phone: '+977-9800000000',
      address: 'Bode Road 21',
      city: 'Bhaktapur',
      postalCode: '44800',
      country: 'Nepal',
    },
  },
  'sample-order-2': {
    id: 'sample-order-2',
    userId: 'demo-user',
    status: 'PROCESSING',
    total: 12990,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    stripePaymentIntentId: null,
    user: {
      id: 'demo-user',
      name: 'Admin User',
      email: 'admin@kalkal.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      role: 'ADMIN',
    },
    items: [
      {
        id: 'sample-item-3',
        quantity: 1,
        price: 12990,
        product: {
          id: 'sample-product-planter',
          name: 'Terracotta Statement Planter',
          currency: 'NPR',
          category: { name: 'Home Decor' },
        },
      },
    ],
    shippingAddress: {
      fullName: 'Admin User',
      email: 'admin@kalkal.com',
      phone: '+977-9800000000',
      address: 'Ring Road 14',
      city: 'Kathmandu',
      postalCode: '44600',
      country: 'Nepal',
    },
  },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const orderId = resolvedParams.id

    const isAdmin = session.user.role === 'ADMIN'
    let orderForInvoice: InvoiceOrder | null = null
    let usedFallback = false

    if (!db) {
      console.error('Database not available for invoice generation')
      const fallbackOrder = SAMPLE_INVOICE_ORDERS[orderId]
      
      if (!fallbackOrder) {
        return NextResponse.json(
          { error: 'Order not available right now', fallback: true },
          { status: 503 }
        )
      }
      
      orderForInvoice = fallbackOrder
      usedFallback = true
    } else {
      try {
        // Get order with related data using joins
        const orderData = await db
          .select({
            id: orders.id,
            userId: orders.userId,
            status: orders.status,
            grandTotal: orders.grandTotal,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(eq(orders.id, orderId))
          .limit(1)
        
        const orderWithRelations = orderData[0] || null
        
        if (orderWithRelations && orderWithRelations.userId) {
          // Get user details
          const userResult = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, orderWithRelations.userId))
            .limit(1)
          
          const user = userResult[0]
          
          // Get order items
          const itemsResult = await db
            .select({
              id: orderItems.id,
              quantity: orderItems.quantity,
              price: orderItems.price,
              productId: orderItems.productId,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId))
          
          // For each item, get product and category details
          const items = []
          for (const item of itemsResult) {
            const productResult = await db
              .select({
                id: products.id,
                name: products.name,
                currency: products.currency,
                categoryId: products.categoryId,
              })
              .from(products)
              .where(eq(products.id, item.productId))
              .limit(1)
            
            const product = productResult[0]
            
            let category = null
            if (product?.categoryId) {
              const categoryResult = await db
                .select({
                  name: categories.name,
                })
                .from(categories)
                .where(eq(categories.id, product.categoryId))
                .limit(1)
              
              category = categoryResult[0]
            }
            
            items.push({
              id: item.id,
              quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity),
              price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
              product: {
                id: product?.id || '',
                name: product?.name || '',
                currency: product?.currency || '',
                category: category ? { name: category.name } : undefined,
              },
            })
          }

          const isOwner = orderWithRelations.userId === session.user.id
          if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
          }

          orderForInvoice = {
            id: orderWithRelations.id,
            userId: orderWithRelations.userId as string,
            status: orderWithRelations.status,
            total: typeof orderWithRelations.grandTotal === 'string' ? parseFloat(orderWithRelations.grandTotal as any) : Number(orderWithRelations.grandTotal),
            createdAt: new Date(orderWithRelations.createdAt),
            stripePaymentIntentId: null,
            user: {
              id: user?.id as string,
              name: user?.name as string,
              email: user?.email as string,
              createdAt: new Date(user?.createdAt as Date),
              role: (user?.role as string) || 'CUSTOMER',
            },
            items: items,
            shippingAddress: null, // Add shipping address if available
          }
        }
      } catch (dbError) {
        console.error('Invoice DB query failed, attempting fallback invoice:', dbError)
      }
    }

    if (!orderForInvoice) {
      const fallbackOrder = SAMPLE_INVOICE_ORDERS[orderId]

      if (!fallbackOrder) {
        return NextResponse.json(
          { error: 'Order not available right now', fallback: true },
          { status: 503 }
        )
      }

      orderForInvoice = fallbackOrder
      usedFallback = true
    }

    if (usedFallback && !isAdmin) {
      return NextResponse.json(
        {
          error: 'Invoice service temporarily unavailable. Please try again later.',
          fallback: true,
        },
        { status: 503 }
      )
    }

    console.log('Generating PDF invoice for order:', orderId)
    const invoiceBuffer = await generateInvoicePDF(orderForInvoice)
    console.log('Invoice buffer generated, size:', invoiceBuffer.length)
    
    if (!invoiceBuffer || invoiceBuffer.length === 0) {
      console.error('Invoice buffer is empty or null')
      throw new Error('Failed to generate invoice content - empty buffer')
    }

    // Set response headers for PDF download
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="invoice-${orderForInvoice.id.slice(-8).toUpperCase()}.pdf"`)
    headers.set('Content-Length', invoiceBuffer.length.toString())
    headers.set('Cache-Control', 'no-cache')

    return new NextResponse(invoiceBuffer as BodyInit, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Invoice generation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}