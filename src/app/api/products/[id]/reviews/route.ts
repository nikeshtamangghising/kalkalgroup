import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Create a new Supabase client instance for this route
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(supabaseUrl, supabaseKey)
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
    
    const supabase = getSupabaseClient()

    // Check if product exists using Supabase
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (productError || !product) {
      console.log('Product not found for ID:', id, productError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product found:', product)

    // Get approved reviews with user information
    console.log('Fetching reviews...')
    const { data: reviewsResult, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        content,
        created_at,
        helpful_votes,
        is_verified,
        user:users(id, name, image)
      `)
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      throw new Error(reviewsError.message)
    }

    console.log('Reviews fetched:', reviewsResult?.length)

    // Calculate average rating and total count
    console.log('Calculating rating stats...')
    const { data: avgData, error: avgError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', id)
      .eq('is_approved', true)

    if (avgError) {
      console.error('Error calculating average:', avgError)
    }

    // Calculate average manually
    let avgRating = 0
    if (avgData && avgData.length > 0) {
      const sum = avgData.reduce((acc: number, review: any) => acc + review.rating, 0)
      avgRating = sum / avgData.length
    }

    const { count: reviewCount, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id)
      .eq('is_approved', true)

    if (countError) {
      console.error('Error counting reviews:', countError)
    }

    console.log('Avg rating:', avgRating)
    console.log('Review count:', reviewCount)

    const ratingStats = {
      average: Number(avgRating),
      count: Number(reviewCount) || 0
    }

    console.log('Rating stats:', ratingStats)

    // Transform the reviews data to match the expected format
    const transformedReviews = reviewsResult?.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.created_at,
      helpfulVotes: review.helpful_votes || 0,
      isVerified: review.is_verified || false,
      user: review.user ? {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image
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
    
    const supabase = getSupabaseClient()

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (productError || !product) {
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
      const { data: existingReview, error: existingReviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', id)
        .eq('user_id', session.user.id)
        .single()

      if (existingReview && !existingReviewError) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
    }

    // Create the review
    const { data: review, error: insertError }: any = await supabase
      .from('reviews')
      .insert({
        product_id: id,
        user_id: session?.user?.id || null,
        rating: rating,
        title: title || null,
        content: content,
        is_verified: false,
        is_approved: session?.user?.role === 'ADMIN',
        helpful_votes: 0
      })
      .select(`
        id,
        rating,
        title,
        content,
        created_at,
        helpful_votes,
        is_verified,
        user:users(id, name, image)
      `)
      .single()

    if (insertError) {
      console.error('Error creating review:', insertError)
      throw new Error(insertError.message)
    }

    // Transform the review data to match the expected format
    const transformedReview: any = {
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.created_at,
      helpfulVotes: review.helpful_votes || 0,
      isVerified: review.is_verified || false,
      user: review.user ? {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image
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