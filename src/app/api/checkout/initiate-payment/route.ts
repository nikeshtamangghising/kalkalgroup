export const runtime = 'nodejs'

import { z } from 'zod'
import { 
  createPublicAPIRoute,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { checkoutService } from '@/lib/backend/services/checkout-service'

const initiatePaymentSchema = z.object({
  method: z.enum(['esewa', 'khalti', 'cod']),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
  })).min(1, 'Cart must have at least one item'),
  guestEmail: z.string().email().optional(),
  shippingAddress: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
  }).optional(),
})

export const POST = createPublicAPIRoute(
  async (_, { body }) => {
    const checkoutData = {
      method: body.method,
      items: body.items,
      guestEmail: body.guestEmail,
      shippingAddress: body.shippingAddress,
      userId: undefined, // Public route doesn't have user context
    }

    const result = await checkoutService.initiateCheckout(checkoutData)

    return createSuccessResponse(
      result,
      result.orderCreated 
        ? 'Order created successfully' 
        : 'Payment initiated successfully'
    )
  },
  {
    rateLimit: 'api',
    validation: {
      body: initiatePaymentSchema
    }
  }
)