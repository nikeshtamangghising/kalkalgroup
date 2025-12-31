import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories, brands, products } from '@/lib/db/schema'
import { eq, and, sql, asc } from 'drizzle-orm'

export async function GET(_request: NextRequest) {
  try {
    // Get unique categories from active products
    const categoriesResult = await db.select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.name))

    // Get unique brands from active products
    const brandsResult = await db.select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug
    })
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name))

    // Get price range from active products
    const [minResult, maxResult] = await Promise.all([
      db.select({ min: sql<number>`min(${products.basePrice})` })
        .from(products)
        .where(eq(products.status, 'PUBLISHED')),
      db.select({ max: sql<number>`max(${products.basePrice})` })
        .from(products)
        .where(eq(products.status, 'PUBLISHED'))
    ])

    const priceRange = {
      _min: { price: parseFloat(minResult[0]?.min?.toString() || '0') },
      _max: { price: parseFloat(maxResult[0]?.max?.toString() || '1000') }
    }

    // Get available tags
    const tagsResult = await db.select({ tags: products.tags })
      .from(products)
      .where(
        and(
          eq(products.status, 'PUBLISHED'),
          sql`${products.tags} IS NOT NULL AND array_length(${products.tags}, 1) > 0`
        )
      )

    // Flatten and deduplicate tags
    const allTags = tagsResult.flatMap((product: { tags: string[] | null }) => product.tags || [])
    const uniqueTags = [...new Set(allTags)].sort()

    const filters = {
      categories: categoriesResult
        .map((cat: { id: string; name: string; slug: string }) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          productCount: 0
        })),
      brands: brandsResult
        .map((brand: { id: string; name: string; slug: string }) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          productCount: 0
        })),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 1000
      },
      tags: uniqueTags,
      ratings: []
    }

    return NextResponse.json(filters, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product filters' },
      { status: 500 }
    )
  }
}