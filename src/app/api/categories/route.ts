import { z } from 'zod'
import { 
  createPublicAPIRoute,
  createAdminAPIRoute,
  createSuccessResponse
} from '@/lib/backend/middleware/api-wrapper'
import { categoryRepository } from '@/lib/category-repository'

const getCategoriesSchema = z.object({
  type: z.enum(['navigation', 'hierarchy', 'flat', 'search', 'all']).default('all'),
  search: z.string().optional(),
  includeInactive: z.boolean().default(false)
})

export const GET = createPublicAPIRoute(
  async (_, { query }) => {
    const { type, search, includeInactive } = query

    let categories

    switch (type) {
      case 'navigation':
        categories = await categoryRepository.getNavigationCategories()
        break
      case 'hierarchy':
        categories = await categoryRepository.getRootCategoriesWithChildren()
        break
      case 'flat':
        categories = await categoryRepository.getAllFlat(includeInactive)
        break
      case 'search':
        if (!search) {
          throw new Error('Search query is required for search type')
        }
        categories = await categoryRepository.search(search)
        break
      default:
        categories = await categoryRepository.getAllFlat(includeInactive)
    }

    return createSuccessResponse(
      {
        categories,
        count: categories.length
      },
      'Categories retrieved successfully'
    )
  },
  {
    rateLimit: 'api',
    validation: {
      query: getCategoriesSchema
    },
    cache: {
      ttl: 600, // 10 minutes
      tags: ['categories']
    }
  }
)

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  image: z.string().optional()
})

export const POST = createAdminAPIRoute(
  async (_, { body }) => {
    const category = await categoryRepository.create({
      name: body.name,
      description: body.description,
      parent_id: body.parentId || undefined,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      image: body.image
    })

    return createSuccessResponse(
      category,
      'Category created successfully',
      201
    )
  },
  {
    rateLimit: 'admin',
    validation: {
      body: createCategorySchema
    }
  }
)
