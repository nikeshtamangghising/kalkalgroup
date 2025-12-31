import { NextResponse } from 'next/server'

// Simple status endpoint to check if gallery API is working
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Gallery API is working',
      timestamp: new Date().toISOString(),
      endpoints: {
        list: '/api/gallery',
        single: '/api/gallery/[id]',
        create: 'POST /api/gallery',
        update: 'PUT /api/gallery/[id]',
        delete: 'DELETE /api/gallery/[id]'
      },
      note: 'API will use mock data if database is not available'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Gallery API error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}