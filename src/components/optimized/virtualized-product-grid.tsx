'use client'

import { memo, useMemo } from 'react'
import { ProductWithCategory } from '@/types'
import ProductCard from '@/components/products/product-card'

interface VirtualizedProductGridProps {
  products: ProductWithCategory[]
  containerWidth: number
  containerHeight: number
  itemWidth?: number
  itemHeight?: number
  gap?: number
  compact?: boolean
}

const VirtualizedProductGrid = memo(({
  products,
  containerHeight,
  compact = false
}: VirtualizedProductGridProps) => {
  // Note: Simplified to regular grid for compatibility
  // Future: Implement proper virtualization with react-window when needed

  // Memoized grid classes
  const gridClasses = useMemo(() => {
    if (compact) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3'
    }
    return 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6'
  }, [compact])

  // Memoized product cards with unique keys
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No products to display</p>
      </div>
    )
  }

  return (
    <div 
      className={gridClasses}
      style={{ 
        maxHeight: containerHeight,
        overflowY: 'auto'
      }}
    >
      {productCards}
    </div>
  )
})

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid'

export default VirtualizedProductGrid