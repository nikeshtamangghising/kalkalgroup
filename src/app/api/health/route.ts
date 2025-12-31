import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Health check endpoint to verify database connection
export async function GET() {
  if (!db) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: 'DATABASE_URL not configured'
      },
      message: 'Database connection failed - DATABASE_URL not set'
    }, { status: 500 })
  }
  
  try {
    // Test basic database connection
    await db.execute('SELECT 1 as test')
    
    // Check if gallery table exists
    let galleryTableExists = false
    let galleryCount = 0
    
    try {
      const tableCheck = await db.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'gallery'
      `) as unknown as { table_name?: string }[]
      
      galleryTableExists = tableCheck.length > 0
      
      if (galleryTableExists) {
        const countResult = await db.execute('SELECT COUNT(*) as count FROM gallery') as unknown as {
          count?: string | number
        }[]
        const countValue = countResult[0]?.count ?? 0
        galleryCount = typeof countValue === 'string' ? parseInt(countValue, 10) : Number(countValue)
      }
    } catch (err) {
      // Gallery table doesn't exist or other error
      console.log('Gallery table check failed:', err)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        galleryTable: {
          exists: galleryTableExists,
          itemCount: galleryCount
        }
      },
      message: galleryTableExists 
        ? `Gallery system ready with ${galleryCount} items`
        : 'Database connected but gallery table not found. Run database migrations.'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      message: 'Database connection failed'
    }, { status: 500 })
  }
}