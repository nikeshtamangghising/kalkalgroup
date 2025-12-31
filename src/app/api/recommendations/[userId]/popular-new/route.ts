import { NextRequest, NextResponse } from 'next/server'
import { RecommendationRepository } from '@/lib/recommendation-repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)

    await params // Resolve params but don't use userId

    const { products, total } = await RecommendationRepository.getPopular(limit)

    const response = NextResponse.json({
      success: true,
      products,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response

  } catch (error: any) {
    console.error('Popular recommendations error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular recommendations',
        details: error.message,
        stack: error.stack,
        products: [],
        total: 0,
        pagination: {
          page: 1,
          limit: 12,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    )
  }
}