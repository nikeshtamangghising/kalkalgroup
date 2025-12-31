import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Since guestEmail is not in schema, return empty response for now
    // TODO: Implement guest order tracking when guest functionality is added
    const orders = {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: orders
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
