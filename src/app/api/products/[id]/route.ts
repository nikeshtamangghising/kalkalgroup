import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/product-repository'
import { updateProductSchema } from '@/lib/validations'
import { createAdminHandler } from '@/lib/auth-middleware'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    
    // Validate the ID format
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }
    
    const product = await productRepository.findById(id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = createAdminHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { params: paramsPromise } = context
  try {
    const [body, params] = await Promise.all([
      request.json(),
      paramsPromise
    ])
    
    
    const validationResult = updateProductSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await productRepository.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    

    // Check if slug is being updated and if it conflicts
    if (validationResult.data.slug && validationResult.data.slug !== existingProduct.slug) {
      const slugConflict = await productRepository.findBySlug(validationResult.data.slug)
      if (slugConflict && slugConflict.id !== params.id) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update the product data to backfill missing/derived fields without overwriting intentional nulls
    const incoming = validationResult.data as any

    // If name provided but slug missing, regenerate slug
    if (incoming.name && !incoming.slug) {
      incoming.slug = incoming.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Default currency if unset
    if (incoming.currency === undefined || incoming.currency === null) {
      incoming.currency = existingProduct.currency || 'NPR'
    }

    // Arrays default
    if (incoming.images === undefined || incoming.images === null) {
      incoming.images = existingProduct.thumbnailUrl ? [existingProduct.thumbnailUrl] : []
    }
    if (incoming.tags === undefined || incoming.tags === null) {
      incoming.tags = (existingProduct as any).tags || []
    }

    // Meta fallbacks if still empty
    if ((incoming.metaTitle === undefined || incoming.metaTitle === null) && (incoming.name || existingProduct.name)) {
      incoming.metaTitle = incoming.name || existingProduct.name
    }
    if ((incoming.metaDescription === undefined || incoming.metaDescription === null)) {
      const base = incoming.description || existingProduct.description || ''
      incoming.metaDescription = String(base).slice(0, 160)
    }

    // Ensure discountPrice < price when both provided
    if (incoming.discountPrice !== undefined && incoming.price !== undefined) {
      const dp = Number(incoming.discountPrice)
      const p = Number(incoming.price)
      if (!isNaN(dp) && !isNaN(p) && dp >= p) {
        incoming.discountPrice = null
      }
    }

    const updatedProduct = await productRepository.update(params.id, incoming)

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    })

  } catch (error) {
    
    if (error instanceof Error) {
      // Handle Prisma unique constraint violations
      if (error.message.includes('Unique constraint failed on the fields: (`slug`)')) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = createAdminHandler(async (
  _request: NextRequest,
  context: RouteContext
) => {
  const { params: paramsPromise } = context
  try {
    const params = await paramsPromise
    // Check if product exists
    const existingProduct = await productRepository.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Instead of hard delete, we'll soft delete by setting isActive to false
    // This preserves order history
    const updatedProduct = await productRepository.update(params.id, { isActive: false })

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: updatedProduct
    })

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})