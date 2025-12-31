import { z } from 'zod'
import { 
  createPublicAPIRoute,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { productService } from '@/lib/backend/services/product-service'

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  limit: z.number().int().min(1).max(50).default(10),
  type: z.enum(['products', 'all']).default('products')
})

export const GET = createPublicAPIRoute(
  async (_request, { query }) => {
    const { q: searchQuery, limit, type } = query

    let results: any = {}

    if (type === 'products' || type === 'all') {
      const products = await productService.searchProducts(searchQuery, limit)
      results.products = products
    }

    // Future: Add other search types (categories, brands, etc.)
    if (type === 'all') {
      // Could add categories, brands, etc. here
      results.categories = []
      results.brands = []
    }

    return createSuccessResponse(
      results,
      `Search results for "${searchQuery}"`
    )
  },
  {
    rateLimit: 'search',
    validation: {
      query: searchQuerySchema
    },
    cache: {
      ttl: 600, // 10 minutes
      tags: ['search']
    }
  }
)