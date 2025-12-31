'use client'

import { useState, useEffect } from 'react'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/stores/cart-store'

interface CartIconProps {
  className?: string
  badgeClassName?: string
  iconClassName?: string
}

export default function CartIcon({
  className = 'relative p-2 text-gray-700 hover:text-indigo-600 transition-colors',
  badgeClassName = 'bg-indigo-600 text-white',
  iconClassName = 'h-6 w-6'
}: CartIconProps) {
  const { getTotalItems, openCart } = useCartStore()
  const [isClient, setIsClient] = useState(false)

  // Only show cart count after hydration to prevent mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  const itemCount = isClient ? getTotalItems() : 0

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCartIcon className={iconClassName} />
      
      {isClient && itemCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${badgeClassName}`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
