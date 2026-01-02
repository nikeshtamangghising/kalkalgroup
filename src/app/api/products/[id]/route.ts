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
  { params }: RouteContext
) => {
  try {
    const [body, resolvedParams] = await Promise.all([
      request.json(),
      params
    ])
    
    const { id } = resolvedParams
    
    
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
    const existingProduct = await productRepository.findById(id)
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    

    // Check if slug is being updated and if it conflicts
    if (validationResult.data.slug && validationResult.data.slug !== existingProduct.slug) {
      const slugConflict = await productRepository.findBySlug(validationResult.data.slug)
      if (slugConflict && slugConflict.id !== id) {
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

    const updatedProduct = await productRepository.update(id, incoming)

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
  { params }: RouteContext
) => {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('DELETE request received for product ID:', id);
    
    // Validate the ID format
    if (!id) {
      console.log('Invalid product ID provided');
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }
    
    // Check if product exists
    const existingProduct = await productRepository.findById(id)
    console.log('Product found for deletion:', !!existingProduct);
    
    if (!existingProduct) {
      console.log('Product not found for deletion:', id);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    console.log('Product before deletion:', existingProduct);

    // Perform hard delete - completely remove the product from the database
    const deleted = await productRepository.delete(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }
    
    // Return the ID of the deleted product
    const deletedProduct = { id }
    
    console.log('Product after hard deletion:', deletedProduct);

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    })

  } catch (error) {
    console.error('Delete product error:', error)
    
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