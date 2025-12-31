import { z } from 'zod'
import { 
  createPublicAPIRoute,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { cartService } from '@/lib/backend/services/cart-service'

// Base validation schemas
const baseCartIdentifierSchema = z.object({
  userId: z.string().cuid().optional(),
  sessionId: z.string().optional(),
})

// Removed unused cartIdentifierSchema - using individual schemas with validation

const addToCartSchema = baseCartIdentifierSchema.extend({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99).default(1),
}).refine(
  data => data.userId || data.sessionId,
  { message: "Either userId or sessionId must be provided" }
)

const updateCartSchema = baseCartIdentifierSchema.extend({
  cartItemId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
}).refine(
  data => data.userId || data.sessionId,
  { message: "Either userId or sessionId must be provided" }
)

const removeFromCartSchema = baseCartIdentifierSchema.extend({
  cartItemId: z.string().cuid(),
}).refine(
  data => data.userId || data.sessionId,
  { message: "Either userId or sessionId must be provided" }
)

const getCartSchema = baseCartIdentifierSchema.extend({
  summary: z.boolean().default(false),
}).refine(
  data => data.userId || data.sessionId,
  { message: "Either userId or sessionId must be provided" }
)

// Add to cart
export const POST = createPublicAPIRoute(
  async (_, { body }) => {
    const identifier = body.userId 
      ? { userId: body.userId }
      : { sessionId: body.sessionId }

    const cartItem = await cartService.addToCart({
      productId: body.productId,
      quantity: body.quantity,
      ...identifier,
    })

    return createSuccessResponse(
      { item: cartItem },
      'Item added to cart successfully',
      201
    )
  },
  {
    rateLimit: 'api',
    validation: {
      body: addToCartSchema
    }
  }
)

// Get cart items
export const GET = createPublicAPIRoute(
  async (_, { query }) => {
    const identifier = query.userId 
      ? { userId: query.userId }
      : { sessionId: query.sessionId }

    if (query.summary) {
      const summary = await cartService.getCartSummary(identifier)
      return createSuccessResponse(
        { summary },
        'Cart summary retrieved successfully'
      )
    } else {
      const cart = await cartService.getCart(identifier)
      return createSuccessResponse(
        cart,
        'Cart retrieved successfully'
      )
    }
  },
  {
    rateLimit: 'api',
    validation: {
      query: getCartSchema
    },
    cache: {
      ttl: 300, // 5 minutes
      tags: ['cart']
    }
  }
)

// Update cart item quantity
export const PUT = createPublicAPIRoute(
  async (_, { body }) => {
    const identifier = body.userId 
      ? { userId: body.userId }
      : { sessionId: body.sessionId }

    const updatedItem = await cartService.updateCartItem(
      body.cartItemId,
      body.quantity,
      identifier
    )

    return createSuccessResponse(
      { item: updatedItem },
      'Cart item updated successfully'
    )
  },
  {
    rateLimit: 'api',
    validation: {
      body: updateCartSchema
    }
  }
)

// Remove from cart
export const DELETE = createPublicAPIRoute(
  async (_, { body }) => {
    const identifier = body.userId 
      ? { userId: body.userId }
      : { sessionId: body.sessionId }

    await cartService.removeFromCart(body.cartItemId, identifier)

    return createSuccessResponse(
      null,
      'Item removed from cart successfully'
    )
  },
  {
    rateLimit: 'api',
    validation: {
      body: removeFromCartSchema
    }
  }
)