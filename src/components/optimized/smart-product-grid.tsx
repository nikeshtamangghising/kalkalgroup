'use client'

import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { ProductWithCategory } from '@/types'
import ProductCard from '@/components/products/product-card'
import VirtualizedProductGrid from './virtualized-product-grid'

interface SmartProductGridProps {
  products: ProductWithCategory[]
  className?: string
  compact?: boolean
  virtualized?: boolean
  threshold?: number // Number of products to trigger virtualization
}

const SmartProductGrid = memo(({
  products,
  className = '',
  compact = false,
  virtualized = false,
  threshold = 50
}: SmartProductGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 })
  const [shouldVirtualize, setShouldVirtualize] = useState(false)

  // Determine if we should use virtualization
  useEffect(() => {
    setShouldVirtualize(virtualized || products.length > threshold)
  }, [products.length, threshold, virtualized])

  // Measure container size for virtualization
  useEffect(() => {
    if (!shouldVirtualize || !containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: Math.max(600, entry.contentRect.height)
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [shouldVirtualize])

  // Memoized grid classes
  const gridClasses = useMemo(() => {
    if (compact) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3'
    }
    return 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6'
  }, [compact])

  // Memoized product cards for regular grid with unique keys
  const productCards = useMemo(() => {
    return products.map((product, index) => (
      <ProductCard
        key={`${product.id}-${index}`} // Ensure unique keys even with duplicate IDs
        product={product}
        compact={compact}
        trackViews={true}
      />
    ))
  }, [products, compact])

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  // Use virtualized grid for large datasets
  if (shouldVirtualize) {
    return (
      <div ref={containerRef} className={`${className} min-h-[600px]`}>
        <VirtualizedProductGrid
          products={products}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          itemWidth={compact ? 200 : 280}
          itemHeight={compact ? 300 : 400}
          compact={compact}
        />
      </div>
    )
  }

  // Use regular grid for smaller datasets
  return (
    <div className={`${gridClasses} ${className}`}>
      {productCards}
    </div>
  )
})

SmartProductGrid.displayName = 'SmartProductGrid'

export default SmartProductGrid