'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import { ProductWithCategory } from '@/types'

import OptimizedImage from './optimized-image'
import { useCart } from '@/contexts/cart-context'
import { useCartStore } from '@/stores/cart-store'

type CardProduct = ProductWithCategory

type CardLayout = 'grid' | 'list'

interface LazyProductCardProps {
  product: CardProduct
  compact?: boolean
  priority?: boolean
  layout?: CardLayout
}

const LazyProductCard = memo(({
  product,
  compact = false,
  priority = false,
  layout = 'grid',
}: LazyProductCardProps) => {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [buying, setBuying] = useState(false)
  const { addToCart } = useCart()
  const { openCart } = useCartStore()

  // Memoized calculations

  const displayPrice = useMemo(() => 
    Number(product.basePrice)
  , [product.basePrice])

  // Event handlers

  const handleNavigate = useCallback(() => {
    router.push(`/products/${product.slug || product.id}`)
  }, [router, product.slug, product.id])

  const toggleWishlist = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsWishlisted(prev => !prev)
  }, [])

  const handleQuickBuy = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (buying) return
    try {
      setBuying(true)
      const productCopy = JSON.parse(JSON.stringify(product))
      const success = await addToCart(productCopy, 1)
      if (success) {
        openCart()
      }
    } finally {
      setBuying(false)
    }
  }, [addToCart, openCart, product, buying])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  return (
    <Card
      className={`group relative h-full overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_35px_65px_rgba(0,0,0,0.15)] ${
        layout === 'list' ? 'flex flex-col md:flex-row md:items-stretch md:min-h-[360px]' : ''
      } ${compact ? 'p-0' : ''}`}
      onClick={handleNavigate}
    >
      <div className={`relative ${layout === 'list' ? 'md:w-1/2 md:max-w-[52%] md:flex-shrink-0' : ''}`}>

        {/* Wishlist */}
        <button
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow-lg transition hover:text-red-500"
          onClick={toggleWishlist}
        >
          <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {/* Inventory and other badges need proper schema fields */}
        </div>

        {/* Product Image */}
        <div
          className={`relative overflow-hidden bg-[#F5EAD7] ${
            layout === 'list'
              ? 'rounded-[28px] aspect-[4/5] md:aspect-auto md:h-full md:min-h-[360px] md:rounded-r-none md:rounded-l-[28px]'
              : 'rounded-[28px] aspect-[4/5]'
          }`}
        >
          <OptimizedImage
            src={product.thumbnailUrl || '/placeholder-product.svg'}
            alt={product.name}
            width={360}
            height={450}
            className={`h-full w-full object-cover object-center transition duration-500 ${
              imageLoaded ? 'scale-100' : 'scale-105'
            } group-hover:scale-105`}
            priority={priority}
            onLoad={handleImageLoad}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/30 to-transparent" />
        </div>
      </div>

      <CardContent className={`flex flex-1 flex-col pb-6 pt-5 ${
        layout === 'list'
          ? 'pl-4 pr-5 sm:pl-6 sm:pr-8 lg:pl-7 lg:pr-10'
          : 'px-6'
      }`}>
        <div className={`mb-3 flex items-center text-xs uppercase tracking-[0.25em] text-gray-500 ${layout === 'list' ? 'justify-start gap-3' : 'justify-between'}`}>
          <span>{product.category?.name || 'Kal Kal'}</span>
          {/* Weight field doesn't exist in schema */}
        </div>

        <div className={`mb-4 ${layout === 'list' ? 'space-y-2' : 'space-y-1'}`}>
          <div className={`${layout === 'list' ? 'flex flex-wrap items-center gap-3' : ''}`}>
            <h3 className="text-lg font-semibold text-[#1B4332] line-clamp-2">{product.name}</h3>
            {product.brand?.name && layout === 'list' && (
              <span className="rounded-full bg-[#F0E8D7] px-3 py-1 text-[11px] font-semibold text-[#7A5A1B] uppercase tracking-[0.2em]">
                {product.brand.name}
              </span>
            )}
          </div>
          {product.description && (
            <p className={`text-sm text-[#5C5C5C] ${layout === 'list' ? 'line-clamp-3' : 'line-clamp-2'}`}>{product.description}</p>
          )}
        </div>

        <div className={`mb-5 flex flex-wrap items-center gap-2 ${layout === 'list' ? 'text-lg' : ''}`}>
          <span className="text-2xl font-bold text-[#1B4332]">
            {formatCurrency(displayPrice, product.currency || DEFAULT_CURRENCY)}
          </span>
          {/* No discount price field in schema */}
        </div>

        <div className={`mt-auto ${layout === 'list' ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'}`}>
          <button
            onClick={(event) => {
              event.preventDefault()
              handleNavigate()
            }}
            className="inline-flex items-center justify-center rounded-full border border-[#D4A017] px-4 py-2 text-sm font-semibold text-[#1B4332] transition hover:bg-[#D4A017] hover:text-white"
          >
            View Product
          </button>
          <button
            onClick={handleQuickBuy}
            disabled={buying}
            className={`inline-flex items-center justify-center rounded-full bg-[#D4A017] px-4 py-2 text-sm font-semibold text-[#1B4332] transition hover:bg-[#E6B800] ${buying ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {buying ? 'Adding…' : 'Buy Now'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
})

// Custom comparison function for better performance
const areEqual = (prevProps: LazyProductCardProps, nextProps: LazyProductCardProps) => {

  const prev = prevProps.product
  const next = nextProps.product
  
  return (
    prev.id === next.id &&
    prev.name === next.name &&
    prev.basePrice === next.basePrice &&
    prev.thumbnailUrl === next.thumbnailUrl &&
    prev.category?.name === next.category?.name &&
    prev.brand?.name === next.brand?.name &&
    prevProps.compact === nextProps.compact &&
    prevProps.priority === nextProps.priority &&
    prevProps.layout === nextProps.layout
  )
}

LazyProductCard.displayName = 'LazyProductCard'

export default memo(LazyProductCard, areEqual)