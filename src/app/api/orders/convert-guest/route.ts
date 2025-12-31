import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const convertGuestOrderSchema = z.object({
  guestEmail: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parse = convertGuestOrderSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parse.error.issues },
        { status: 400 }
      )
    }

    const { guestEmail } = parse.data

    // Check if user already exists with this email
    if (!db) {
      throw new Error('Database not available');
    }
    const existingUserResult = await db.select()
      .from(users)
      .where(eq(users.email, guestEmail))
      .limit(1)
    const existingUser = existingUserResult[0] || null

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // NOTE: The current relational schema no longer stores guest orders directly
    // on the orders table (guestEmail / isGuestOrder columns were removed).
    // Proper guest-order conversion would require a dedicated migration and
    // repository logic. To avoid inconsistent writes, this endpoint currently
    // reports the feature as unavailable.

    return NextResponse.json(
      {
        error: 'Guest order conversion is not available with the current database schema.',
      },
      { status: 501 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert guest orders' },
      { status: 500 }
    )
  }
}
