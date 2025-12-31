import { memo, useMemo } from 'react'
import { Product } from '@/types'
import LazyProductCard from '@/components/optimized/lazy-product-card'

interface ProductGridProps {
  products: Product[]
  compact?: boolean
}

const ProductGrid = memo(({ products, compact = false }: ProductGridProps) => {
  // Memoized grid classes
  const gridClasses = useMemo(() => {
    if (compact) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3'
    }
    return 'grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  }, [compact])

  // Memoized product cards with unique keys
  const productCards = useMemo(() => {
    return products.map((product, index) => (
      <LazyProductCard
        key={`${product.id}-${index}`} // Ensure unique keys even with duplicate IDs
        product={product as any}
        compact={compact}
        priority={index < 4} // Prioritize first 4 images
      />
    ))
  }, [products, compact])

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      {productCards}
    </div>
  )
})

ProductGrid.displayName = 'ProductGrid'

export default ProductGrid
