import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, products, users } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const createReviewSchema = {
  safeParse: (data: any) => {
    const errors = []
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push({ path: ['rating'], message: 'Rating must be between 1 and 5' })
    }
    
    if (!data.content || data.content.length < 1 || data.content.length > 2000) {
      errors.push({ path: ['content'], message: 'Content must be between 1 and 2000 characters' })
    }
    
    if (data.title && data.title.length > 255) {
      errors.push({ path: ['title'], message: 'Title must be less than 255 characters' })
    }
    
    if (data.guestName && data.guestName.length > 100) {
      errors.push({ path: ['guestName'], message: 'Guest name must be less than 100 characters' })
    }
    
    if (data.guestEmail && !data.guestEmail.includes('@')) {
      errors.push({ path: ['guestEmail'], message: 'Invalid email format' })
    }
    
    return {
      success: errors.length === 0,
      error: { issues: errors },
      data
    }
  }
}

// GET /api/products/[id]/reviews - Get all reviews for a product
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching reviews for product ID:', id)

    // Check if product exists using Drizzle
    const product = await db.select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then(r => r[0] || null)

    if (!product) {
      console.log('Product not found for ID:', id)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product found:', product)

    // Get approved reviews with user information
    console.log('Fetching reviews...')
    const reviewsResult = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      createdAt: reviews.createdAt,
      helpfulVotes: reviews.helpfulVotes,
      isVerified: reviews.isVerified,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.productId, id),
        eq(reviews.isApproved, true)
      ))
      .orderBy(desc(reviews.createdAt))

    console.log('Reviews fetched:', reviewsResult?.length)

    // Calculate average rating and total count
    console.log('Calculating rating stats...')
    const avgData = await db.select({ rating: reviews.rating })
      .from(reviews)
      .where(and(
        eq(reviews.productId, id),
        eq(reviews.isApproved, true)
      ))

    // Calculate average manually
    let avgRating = 0
    if (avgData && avgData.length > 0) {
      const sum = avgData.reduce((acc: number, review: any) => acc + review.rating, 0)
      avgRating = sum / avgData.length
    }

    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(and(
        eq(reviews.productId, id),
        eq(reviews.isApproved, true)
      ))
      .then(r => r[0]?.count || 0)

    console.log('Avg rating:', avgRating)
    console.log('Review count:', countResult)

    const ratingStats = {
      average: Number(avgRating),
      count: Number(countResult) || 0
    }

    console.log('Rating stats:', ratingStats)

    // Transform reviews data to match expected format
    const transformedReviews = reviewsResult?.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt,
      helpfulVotes: review.helpfulVotes || 0,
      isVerified: review.isVerified || false,
      user: review.user ? {
        id: review.user.id,
        name: review.user.name,
        image: review.user.avatarUrl
      } : undefined
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        ratingStats
      }
    })

  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Check if product exists
    const product = await db.select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then(r => r[0] || null)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validationResult: any = createReviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { rating, title, content, guestName, guestEmail } = validationResult.data

    // Check if user is logged in or if guest information is provided
    if (!session?.user?.id && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { error: 'Authentication required or guest information must be provided' },
        { status: 401 }
      )
    }

    // Check if user has already reviewed this product
    if (session?.user?.id) {
      const existingReview = await db.select({ id: reviews.id })
        .from(reviews)
        .where(and(
          eq(reviews.productId, id),
          eq(reviews.userId, session.user.id)
        ))
        .limit(1)
        .then(r => r[0] || null)

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
    }

    // Create review
    const [review] = await db.insert(reviews)
      .values({
        productId: id,
        userId: session?.user?.id || null,
        rating: rating,
        title: title || null,
        content: content,
        isVerified: false,
        isApproved: session?.user?.role === 'ADMIN',
        helpfulVotes: 0
      })
      .returning()

    // Get the review with user information
    const reviewWithUser = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      createdAt: reviews.createdAt,
      helpfulVotes: reviews.helpfulVotes,
      isVerified: reviews.isVerified,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.id, review.id))
      .limit(1)
      .then(r => r[0])

    // Transform review data to match expected format
    const transformedReview: any = {
      id: reviewWithUser.id,
      rating: reviewWithUser.rating,
      title: reviewWithUser.title,
      content: reviewWithUser.content,
      createdAt: reviewWithUser.createdAt,
      helpfulVotes: reviewWithUser.helpfulVotes || 0,
      isVerified: reviewWithUser.isVerified || false,
      user: reviewWithUser.user ? {
        id: reviewWithUser.user.id,
        name: reviewWithUser.user.name,
        image: reviewWithUser.user.avatarUrl
      } : undefined
    }

    return NextResponse.json({
      success: true,
      data: transformedReview,
      message: session?.user?.role === 'ADMIN' 
        ? 'Review submitted successfully' 
        : 'Review submitted and is pending approval'
    })

  } catch (error) {
    console.error('Error creating product review:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}