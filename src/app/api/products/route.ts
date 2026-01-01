import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/product-repository'
import { z } from 'zod'

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

const filtersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isActive: z.boolean().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']).default('newest')
})

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().min(0, 'Price must be positive'),
  basePrice: z.number().min(0, 'Base price must be positive'),
  purchasePrice: z.number().nullable().optional(),
  discountPrice: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  dimensions: z.object({
    length: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  }).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  category: z.string().min(1, 'Category is required').optional(), // Keep for backward compatibility
  brandId: z.string().nullable().optional(),
  brand: z.string().nullable().optional(), // Keep for backward compatibility
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  inventory: z.number().default(0),
  stockQuantity: z.number().default(0).optional(), // Keep for backward compatibility
  lowStockThreshold: z.number().default(5),
  minStockLevel: z.number().default(5).optional(), // Keep for backward compatibility
  thumbnailUrl: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  currency: z.string().default('NPR'),
  status: z.string().default('PUBLISHED'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })
    
    const filters = filtersSchema.parse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      sort: searchParams.get('sort') || 'newest'
    })

    const result = await productRepository.findMany(filters, pagination)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Products retrieved successfully'
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = createProductSchema.parse(body)
    
    // Prepare data for product repository with proper field mapping
    const productData = {
      ...validatedData,
      // Map legacy fields to actual database fields
      categoryId: validatedData.categoryId || validatedData.category,
      brandId: validatedData.brandId || validatedData.brand,
      inventory: validatedData.inventory || validatedData.stockQuantity,
      lowStockThreshold: validatedData.lowStockThreshold || validatedData.minStockLevel,
      // Use basePrice as the main price if price is not provided
      basePrice: validatedData.basePrice || validatedData.price,
      // Ensure slug is generated if not provided
      slug: validatedData.slug || validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    const product = await productRepository.create(productData)
    
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create product error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
