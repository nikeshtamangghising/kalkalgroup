import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { productRepository } from '@/lib/product-repository'

// Simplified cart item type for summary calculations
type SimplifiedCartItem = {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    discountPrice: number | null
    images: string[]
    slug: string
  }
}

// Validation schema for cart summary request
const cartSummarySchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    product: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      discountPrice: z.number().nullable().optional().transform(val => val === undefined ? null : val),
      images: z.array(z.string()),
      slug: z.string(),
    }).optional(),
  })).min(1, 'Cart must have at least one item'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validationResult = cartSummarySchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.issues)
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { items } = validationResult.data

    // Validate and enrich cart items with current product data
    const cartItems: SimplifiedCartItem[] = []
    for (const item of items) {
      let product = item.product
      
      // If product data is not provided, fetch from database
      if (!product) {
        const dbProduct = await productRepository.findById(item.productId)
        
        if (!dbProduct) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 404 }
          )
        }

        if (dbProduct.status !== 'PUBLISHED') {
          return NextResponse.json(
            { error: `Product ${dbProduct.name} is no longer available` },
            { status: 400 }
          )
        }

        product = {
          id: dbProduct.id,
          name: dbProduct.name,
          price: typeof dbProduct.basePrice === 'string' ? parseFloat(dbProduct.basePrice) : dbProduct.basePrice,
          discountPrice: null,
          images: dbProduct.thumbnailUrl ? [dbProduct.thumbnailUrl] : [],
          slug: dbProduct.slug,
        }
      }

      cartItems.push({
        productId: item.productId,
        quantity: item.quantity,
        product,
      })
    }

    
    // Calculate summary using simplified calculation
    let summary
    try {
      // Use direct calculation since we have simplified product data
      const subtotal = cartItems.reduce((total, item) => {
        const price = item.product.discountPrice || item.product.price
        return total + (price * item.quantity)
      }, 0)
      
      const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
      const freeShippingThreshold = 200 // NPR 200 for free shipping
      const shipping = subtotal >= freeShippingThreshold ? 0 : 200 // NPR 200 for shipping
      const tax = subtotal * 0.13 // 13% VAT
      const total = subtotal + shipping + tax

      summary = {
        subtotal,
        shipping,
        tax,
        total,
        itemsCount,
        freeShippingThreshold,
        freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal),
        taxRate: 0.13,
        shippingRate: 200
      }
    } catch (error) {
      // Fallback calculation (same as above)
      const subtotal = cartItems.reduce((total, item) => {
        const price = item.product.discountPrice || item.product.price
        return total + (price * item.quantity)
      }, 0)
      
      const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
      const shipping = subtotal >= 200 ? 0 : 200 // NPR 200 for shipping
      const tax = subtotal * 0.13 // 13% VAT
      const total = subtotal + shipping + tax

      summary = {
        subtotal,
        shipping,
        tax,
        total,
        itemsCount,
        freeShippingThreshold: 200,
        freeShippingRemaining: Math.max(0, 200 - subtotal),
        taxRate: 0.13,
        shippingRate: 200
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        itemsCount: summary.itemsCount,
        freeShippingThreshold: summary.freeShippingThreshold,
        freeShippingRemaining: summary.freeShippingRemaining,
        taxRate: summary.taxRate,
        shippingRate: summary.shippingRate,
      },
    })

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}