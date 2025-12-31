export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createPublicAPIRoute,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { checkoutService } from '@/lib/backend/services/checkout-service'
import { parseESewaCallback, parseKhaltiCallback } from '@/lib/payment-gateways'

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  orderId: z.string(),
})

export const POST = createPublicAPIRoute(
  async (_, { body }) => {
    const result = await checkoutService.verifyPayment(
      body.transactionId,
      body.orderId
    )

    return createSuccessResponse(
      result,
      'Payment verified and order created successfully'
    )
  },
  {
    rateLimit: 'api',
    validation: {
      body: verifyPaymentSchema
    }
  }
)

// GET endpoint for handling payment gateway callbacks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const method = searchParams.get('method')
    
    if (!method || !['esewa', 'khalti'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    let parsedData
    
    if (method === 'esewa') {
      parsedData = parseESewaCallback(Object.fromEntries(searchParams.entries()))
      
      // Redirect to success/failure page based on eSewa callback
      const { oid, amt, refId } = parsedData
      
      if (oid && amt && refId) {
        // Success - redirect to verification
        const successUrl = new URL('/checkout/success', request.url)
        successUrl.searchParams.set('method', 'esewa')
        successUrl.searchParams.set('oid', oid)
        successUrl.searchParams.set('amt', amt)
        successUrl.searchParams.set('refId', refId)
        
        return NextResponse.redirect(successUrl.toString())
      } else {
        // Failure - redirect to failure page
        const failureUrl = new URL('/checkout/failure', request.url)
        failureUrl.searchParams.set('method', 'esewa')
        failureUrl.searchParams.set('error', 'Payment failed or cancelled')
        
        return NextResponse.redirect(failureUrl.toString())
      }
    } else if (method === 'khalti') {
      parsedData = parseKhaltiCallback(Object.fromEntries(searchParams.entries()))
      
      // Redirect to success/failure page based on Khalti callback
      const { pidx, status, transaction_id } = parsedData
      
      if (pidx && status && transaction_id) {
        // Success - redirect to verification
        const successUrl = new URL('/checkout/success', request.url)
        successUrl.searchParams.set('method', 'khalti')
        successUrl.searchParams.set('pidx', pidx)
        successUrl.searchParams.set('status', status)
        successUrl.searchParams.set('transaction_id', transaction_id)
        
        return NextResponse.redirect(successUrl.toString())
      } else {
        // Failure - redirect to failure page
        const failureUrl = new URL('/checkout/failure', request.url)
        failureUrl.searchParams.set('method', 'khalti')
        failureUrl.searchParams.set('error', 'Payment failed or cancelled')
        
        return NextResponse.redirect(failureUrl.toString())
      }
    }

    return NextResponse.json(
      { error: 'Invalid payment callback' },
      { status: 400 }
    )

  } catch (error) {
    
    // Redirect to failure page on error
    const failureUrl = new URL('/checkout/failure', request.url)
    failureUrl.searchParams.set('error', 'Payment processing error')
    
    return NextResponse.redirect(failureUrl.toString())
  }
}