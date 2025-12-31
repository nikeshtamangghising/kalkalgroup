import { NextRequest, NextResponse } from 'next/server'
import { getBrandRepository } from '@/lib/brand-repository'
import { createAdminHandler } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search') || undefined

    // Use repository instead of direct DB access
    const brandRepository = getBrandRepository()
    const brands = await brandRepository.findAll(includeInactive, search)

    return NextResponse.json({
      brands,
      total: brands.length
    })

  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, slug, description, logo, website } = body

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (!finalSlug) {
      return NextResponse.json(
        { error: 'Could not generate valid slug from name' },
        { status: 400 }
      )
    }

    const brandRepository = getBrandRepository()

    // Check if name or slug already exists
    // We'll check individually as repository methods are specific
    // Or we could trust the unique constraint error from DB
    const existingSlug = await brandRepository.findBySlug(finalSlug)
    if (existingSlug) {
      return NextResponse.json(
        { error: 'A brand with this slug already exists' },
        { status: 400 }
      )
    }

    // Note: Checking name uniqueness strictly might be tricky without a findByName method
    // but the fallback to DB constraint error is acceptable or we can add findByName later if needed.
    // For now, let's proceed with creation which will throw if name is duplicate (as per schema unique constraint)

    try {
      const brand = await brandRepository.create({
        name,
        slug: finalSlug,
        description,
        logoUrl: logo,
        website,
        isActive: true
      })

      return NextResponse.json(
        {
          message: 'Brand created successfully',
          brand
        },
        { status: 201 }
      )
    } catch (e: any) {
      // Catch unique violation if repository throws it clearly, or generic error
      if (e.message && (e.message.includes('unique') || e.message.includes('duplicate'))) {
        return NextResponse.json(
          { error: 'A brand with this name or slug already exists' },
          { status: 400 }
        )
      }
      throw e
    }

  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
