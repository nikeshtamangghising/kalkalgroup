'use client'

import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import { ProductWithCategory } from '@/types'
import SmartProductGrid from '@/components/optimized/smart-product-grid'

interface RecommendationItem {
  productId: string
  score: number
  reason: string
  product: ProductWithCategory
}

interface OptimizedRecommendationGridProps {
  apiEndpoint: string
  compact?: boolean
  className?: string
}

const OptimizedRecommendationGrid = memo(({
  apiEndpoint,
  compact = false,
  className = ''
}: OptimizedRecommendationGridProps) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch function
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = new URL(apiEndpoint, window.location.origin)
      url.searchParams.set('page', '1')
      url.searchParams.set('limit', '6') // Start with fewer items for faster loading
      
      const response = await fetch(url.toString(), {
        cache: 'force-cache',
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform recommendation response
      let productList: ProductWithCategory[] = []
      if (data.products && Array.isArray(data.products)) {
        productList = data.products.map((item: RecommendationItem) => item.product)
      }
      
      setProducts(productList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  // Fetch data on mount and when endpoint changes
  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-2" />
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ), [])

  // Memoized error state
  const errorState = useMemo(() => (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load recommendations</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={fetchRecommendations}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  ), [error, fetchRecommendations])

  // Memoized empty state
  const emptyState = useMemo(() => (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">📦</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
      <p className="text-gray-500">Check back later for personalized recommendations.</p>
    </div>
  ), [])

  if (loading) {
    return <div className={className}>{loadingSkeleton}</div>
  }

  if (error) {
    return <div className={className}>{errorState}</div>
  }

  if (products.length === 0) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={className}>
      <SmartProductGrid
        products={products}
        compact={compact}
        virtualized={false} // Don't virtualize small recommendation grids
        threshold={50}
      />
    </div>
  )
})

OptimizedRecommendationGrid.displayName = 'OptimizedRecommendationGrid'

export default OptimizedRecommendationGrid