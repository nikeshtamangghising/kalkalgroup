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

    const resolvedParams = await params
    const userId = resolvedParams.userId

    const { products, total } = await RecommendationRepository.getPersonalized(userId, limit)

    const response = NextResponse.json({
      success: true,
      products,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: false,
        hasPrev: false
      }
    })
    response.headers.set('Cache-Control', 'private, max-age=60')
    return response

  } catch (error) {
    console.error('Personalized recommendations error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch personalized recommendations',
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
