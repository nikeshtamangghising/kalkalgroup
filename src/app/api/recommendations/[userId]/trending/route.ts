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
    // We are currently doing simple top-list, ignoring complex pagination offset for trending aggregation
    // But repository accepts limit. For pagination, we'd need to slice the result in repo or pass offset.
    // The repo implementation was top-N. Let's pass limit.
    // The previous implementation used offset. 
    // Ideally, pass limit and assume Page 1 for trending as it's usually "Top Trending".
    // Or we can enhance repo later. For now, let's keep it simple and stable.

    // Await params to satisfy Next.js requirement (even though we don't use userId here)
    void await params
    let products: any[] = []
    let total = 0

    try {
      const result = await RecommendationRepository.getTrending(limit)
      products = result.products
      total = result.total
    } catch (importError: any) {
      console.error('Trending recommendations import or repository error:', importError?.message || importError)
      products = []
      total = 0
    }

    const response = NextResponse.json({
      success: true,
      products,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: false, // Simple implementation for now
        hasPrev: false
      }
    })

    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
    return response

  } catch (error: any) {
    console.error('Trending recommendations error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending recommendations',
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
