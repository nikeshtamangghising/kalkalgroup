import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/order-repository'
import { updateOrderSchema, updateShippingAddressSchema } from '@/lib/validations'
import { createAuthHandler, createAdminHandler } from '@/lib/auth-middleware'
import { getServerSession } from '@/lib/auth'
import { EmailService } from '@/lib/email-service'
import { db } from '@/lib/db-utils'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { OrderStatus } from '@/types'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export const GET = createAuthHandler(async (
  _request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {
    const session = await getServerSession()
    const order = await OrderRepository.findById(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user can access this order
    const isAdmin = session?.user?.role === 'ADMIN'
    const isOwner = order.userId === session?.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)

  } catch (error) {
    console.error('Failed to fetch order, using fallback data:', error)

    const fallbackOrder = SAMPLE_ORDERS.find(order => order.id === id)
    if (fallbackOrder) {
      return NextResponse.json({
        ...fallbackOrder,
        fallback: true,
        message: 'Order service unavailable. Showing sample order for now.'
      })
    }

    return NextResponse.json(
      { 
        error: 'Order not available right now',
        fallback: true
      },
      { status: 503 }
    )
  }
})

export const PUT = createAuthHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {
    const session = await getServerSession()
    const body = await request.json()
    
    // Check if order exists
    const existingOrder = await OrderRepository.findById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user can update this order
    const isAdmin = session?.user?.role === 'ADMIN'
    const isOwner = existingOrder.userId === session?.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if this is a status update or shipping address update
    const isStatusUpdate = body.status !== undefined
    const isShippingAddressUpdate = body.shippingAddress !== undefined

    // Handle status update (admin only)
    if (isStatusUpdate) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only administrators can update order status' },
          { status: 403 }
        )
      }

      const validationResult = updateOrderSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validationResult.error.issues 
          },
          { status: 400 }
        )
      }

      const previousStatus = existingOrder.status
      const newStatus = validationResult.data.status as OrderStatus

      await OrderRepository.updateStatus(id, newStatus)

      // Send order status update email if status changed
      if (previousStatus !== newStatus) {
        try {
          if (!db) {
            throw new Error('Database not available');
          }
          const userResult = await db.select()
            .from(users)
            .where(eq(users.id, existingOrder.userId!))
            .limit(1)
          const user = userResult[0] || null

          if (user) {
            await EmailService.sendOrderStatusUpdate({
              order: existingOrder as any,
              user,
              previousStatus,
              newStatus
            }, true) // Use queue

          }
        } catch (emailError) {
          console.error('Failed to send order status update email:', emailError)
          // Don't fail the order update if email fails
        }
      }

      return NextResponse.json({
        message: 'Order updated successfully',
        order: existingOrder
      })
    }

    // Handle shipping address update (owner or admin, only for pending orders)
    if (isShippingAddressUpdate) {
      // Only allow updating shipping address for pending orders
      if (existingOrder.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Shipping address can only be updated for pending orders' },
          { status: 400 }
        )
      }

      const validationResult = updateShippingAddressSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validationResult.error.issues 
          },
          { status: 400 }
        )
      }

      // Shipping address persistence is not yet wired to the new database schema.
      // To avoid inconsistent data writes, this endpoint currently reports the
      // feature as not implemented instead of performing a partial update.
      return NextResponse.json(
        { error: 'Shipping address updates are not yet supported.' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid update request' },
      { status: 400 }
    )

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Failed to update order:', error)

    return NextResponse.json(
      { error: 'Order service unavailable. Try again later.' },
      { status: 503 }
    )
  }
})

export const DELETE = createAdminHandler(async (
  _request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params
  try {
    // Check if order exists
    const existingOrder = await OrderRepository.findById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled orders
    if (existingOrder.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Only cancelled orders can be deleted' },
        { status: 400 }
      )
    }

    // Order deletion is not implemented yet
    return NextResponse.json(
      { error: 'Order deletion is not supported' },
      { status: 400 }
    )

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Failed to delete order:', error)

    return NextResponse.json(
      { error: 'Order service unavailable. Try again later.' },
      { status: 503 }
    )
  }
})

const SAMPLE_ORDERS: any[] = [
  {
    id: 'sample-order-1',
    userId: 'demo-user',
    guestEmail: null,
    guestName: null,
    status: 'DELIVERED',
    trackingNumber: 'TRACK-45231',
    total: '18990',
    stripePaymentIntentId: null,
    shippingAddress: null,
    isGuestOrder: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    items: [
      {
        id: 'sample-item-1',
        orderId: 'sample-order-1',
        productId: 'sample-product-ceramic',
        quantity: 1,
        price: '12990',
        createdAt: new Date(),
        product: {
          id: 'sample-product-ceramic',
          name: 'Artisan Ceramic Dinner Set',
          slug: 'artisan-ceramic-dinner-set',
          description: 'A 12-piece handcrafted ceramic dinner set.',
          shortDescription: 'Handcrafted ceramic dinner set',
          price: '14990',
          purchasePrice: '9990',
          discountPrice: '12990',
          currency: 'NPR',
          images: [],
          inventory: 42,
          lowStockThreshold: 5,
          sku: 'DIN-SET-001',
          weight: null,
          dimensions: null,
          metaTitle: null,
          metaDescription: null,
          tags: [],
          viewCount: 0,
          orderCount: 0,
          cartCount: 0,
          popularityScore: '0',
          lastScoreUpdate: null,
          purchaseCount: 0,
          ratingAvg: '0',
          ratingCount: 0,
          categoryId: 'sample-category-1',
          brandId: null,
          isActive: true,
          isFeatured: true,
          isNewArrival: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: undefined,
        },
      },
      {
        id: 'sample-item-2',
        orderId: 'sample-order-1',
        productId: 'sample-product-cutlery',
        quantity: 1,
        price: '6000',
        createdAt: new Date(),
        product: {
          id: 'sample-product-cutlery',
          name: 'Matte Black Cutlery Set',
          slug: 'matte-black-cutlery-set',
          description: 'Premium 24-piece matte black stainless cutlery.',
          shortDescription: '24-piece cutlery set',
          price: '7490',
          purchasePrice: '4990',
          discountPrice: '6000',
          currency: 'NPR',
          images: [],
          inventory: 58,
          lowStockThreshold: 8,
          sku: 'CUT-SET-002',
          weight: null,
          dimensions: null,
          metaTitle: null,
          metaDescription: null,
          tags: [],
          viewCount: 0,
          orderCount: 0,
          cartCount: 0,
          popularityScore: '0',
          lastScoreUpdate: null,
          purchaseCount: 0,
          ratingAvg: '0',
          ratingCount: 0,
          categoryId: 'sample-category-2',
          brandId: null,
          isActive: true,
          isFeatured: false,
          isNewArrival: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: undefined,
        },
      },
    ],
    user: null,
  },
  {
    id: 'sample-order-2',
    userId: 'demo-user',
    guestEmail: null,
    guestName: null,
    status: 'PROCESSING',
    trackingNumber: null,
    total: '12990',
    stripePaymentIntentId: null,
    shippingAddress: null,
    isGuestOrder: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(),
    items: [
      {
        id: 'sample-item-3',
        orderId: 'sample-order-2',
        productId: 'sample-product-planter',
        quantity: 1,
        price: '12990',
        createdAt: new Date(),
        product: {
          id: 'sample-product-planter',
          name: 'Terracotta Statement Planter',
          slug: 'terracotta-statement-planter',
          description: 'Large hand-painted terracotta planter.',
          shortDescription: 'Hand-painted planter',
          price: '14990',
          purchasePrice: '9990',
          discountPrice: '12990',
          currency: 'NPR',
          images: [],
          inventory: 15,
          lowStockThreshold: 3,
          sku: 'PLN-TRC-003',
          weight: null,
          dimensions: null,
          metaTitle: null,
          metaDescription: null,
          tags: [],
          viewCount: 0,
          orderCount: 0,
          cartCount: 0,
          popularityScore: '0',
          lastScoreUpdate: null,
          purchaseCount: 0,
          ratingAvg: '0',
          ratingCount: 0,
          categoryId: 'sample-category-3',
          brandId: null,
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: undefined,
        },
      },
    ],
    user: null,
  },
]