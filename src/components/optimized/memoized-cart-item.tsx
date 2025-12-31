'use client'

import { memo, useCallback, useMemo } from 'react'
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { CartItem } from '@/types'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import OptimizedImage from './optimized-image'

interface MemoizedCartItemProps {
  item: CartItem
}

const MemoizedCartItem = memo(({ item }: MemoizedCartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore()

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.productId)
    } else {
      updateQuantity(item.productId, newQuantity)
    }
  }, [item.productId, updateQuantity, removeItem])

  const handleIncrement = useCallback(() => {
    handleQuantityChange(item.quantity + 1)
  }, [item.quantity, handleQuantityChange])

  const handleDecrement = useCallback(() => {
    handleQuantityChange(item.quantity - 1)
  }, [item.quantity, handleQuantityChange])

  const handleRemove = useCallback(() => {
    removeItem(item.productId)
  }, [item.productId, removeItem])

  const itemTotal = useMemo(() => {
    const price = Number(item.product.basePrice)
    return price * item.quantity
  }, [item.product.basePrice, item.quantity])

  const displayPrice = useMemo(() => {
    return Number(item.product.basePrice)
  }, [item.product.basePrice])

  return (
    <div className="flex items-center space-x-4 py-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
        <OptimizedImage
          src={item.product.thumbnailUrl || '/placeholder-product.svg'}
          alt={item.product.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          sizes="64px"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(displayPrice, item.product.currency || DEFAULT_CURRENCY)}
          </span>
          {/* No discount price field in schema */}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="w-4 h-4 text-gray-600" />
        </button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={handleIncrement}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Increase quantity"
        >
          <PlusIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(itemTotal, item.product.currency || DEFAULT_CURRENCY)}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
        aria-label="Remove item"
      >
        <TrashIcon className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
})

// Custom comparison function for better memoization
const areEqual = (prevProps: MemoizedCartItemProps, nextProps: MemoizedCartItemProps) => {
  const prev = prevProps.item
  const next = nextProps.item
  
  return (
    prev.productId === next.productId &&
    prev.quantity === next.quantity &&
    prev.product.basePrice === next.product.basePrice &&
    prev.product.name === next.product.name &&
    prev.product.thumbnailUrl === next.product.thumbnailUrl
  )
}

MemoizedCartItem.displayName = 'MemoizedCartItem'

export default memo(MemoizedCartItem, areEqual)