import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ImageService } from '@/lib/image-service'

// GET /api/admin/diagnostics - System diagnostics
export const GET = createAdminHandler(async (_request: NextRequest) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    
    // Environment
    environment: {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      supabaseUrlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      resendKeyConfigured: !!process.env.RESEND_API_KEY,
    }
  }

  // Test Database connection
  try {
    diagnostics.database = {
      configured: false,
      connected: false,
      tables: {}
    }
    
    diagnostics.database.configured = !!process.env.DATABASE_URL
    
    if (!db) {
      diagnostics.database.connected = false
      diagnostics.database.error = 'Database not available'
    } else {
      // Test basic connection
      await db.select({ count: sql`1` })
      diagnostics.database.connected = true

      // Test key tables
      const tables = ['products', 'categories', 'users', 'orders']
      for (const table of tables) {
        try {
          await db.select().from(sql`${table}`).limit(1)
          diagnostics.database.tables[table] = 'accessible'
        } catch (error) {
          diagnostics.database.tables[table] = 'error'
        }
      }
  }
  } catch (error) {
    diagnostics.database.connected = false
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test Cloudinary
  try {
    diagnostics.cloudinary = {
      configured: false,
      connected: false,
      error: null
    }
    
    diagnostics.cloudinary.configured = ImageService.isConfigured()
    
    if (diagnostics.cloudinary.configured) {
      diagnostics.cloudinary.connected = true
    }
  } catch (error) {
    diagnostics.cloudinary.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    success: true,
    diagnostics
  })
})