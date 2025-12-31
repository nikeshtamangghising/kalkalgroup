'use client'

import { memo, useMemo, useRef, useEffect } from 'react'
import { ProductWithCategory, PaginatedResponse } from '@/types'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import SmartProductGrid from './smart-product-grid'

interface InfiniteScrollGridProps {
  initialData: PaginatedResponse<ProductWithCategory>
  apiEndpoint: string
  searchParams?: Record<string, string | undefined>
  className?: string
  compact?: boolean
  virtualized?: boolean
  pageSize?: number
  threshold?: number
}

const InfiniteScrollGrid = memo(({
  initialData,
  apiEndpoint,
  searchParams = {},
  className = '',
  compact = false,
  virtualized = false,
  pageSize = 20,
  threshold = 50
}: InfiniteScrollGridProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  
  const {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    retry,
    fetchNextPage
  } = useInfiniteScroll({
    initialData,
    fetchUrl: apiEndpoint,
    pageSize,
    searchParams
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loadingMore && hasMore) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, fetchNextPage])

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className={`grid ${compact 
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
      : 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
    }`}>
      {Array.from({ length: pageSize }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ), [compact, pageSize])

  if (loading && products.length === 0) {
    return <div className={className}>{loadingSkeleton}</div>
  }

  if (error && products.length === 0) {
    return (
      <div className={`${className} flex flex-col items-center justify-center py-12`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`${className} flex flex-col items-center justify-center py-12`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Products Grid */}
      <SmartProductGrid
        products={products}
        compact={compact}
        virtualized={virtualized}
        threshold={threshold}
      />

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-6 py-3 rounded-full">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-sm font-medium">Loading more products...</span>
          </div>
        </div>
      )}

      {/* Error State for Loading More */}
      {error && products.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && products.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-gray-500 text-sm">
              You've seen all {products.length} products
            </p>
          </div>
        </div>
      )}

      {/* Intersection Observer Sentinel */}
      <div
        ref={sentinelRef}
        className="h-4 w-full"
        aria-hidden="true"
      />
    </div>
  )
})

InfiniteScrollGrid.displayName = 'InfiniteScrollGrid'

export default InfiniteScrollGrid