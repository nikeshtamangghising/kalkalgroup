'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useCartStore } from '@/stores/cart-store'
import { Product } from '@/types'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'

interface MobileProductActionsProps {
  product: Product
}

export default function MobileProductActions({ product }: MobileProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { addToCart, isLoading } = useCart()
  const { openCart } = useCartStore()
  const router = useRouter()

  // Check if we're on mobile device and handle visibility
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768 // md breakpoint
      setIsMobile(mobile)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Show from the beginning on mobile
  useEffect(() => {
    if (isMobile) {
      setIsVisible(true)
    }
  }, [isMobile])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    const productCopy = JSON.parse(JSON.stringify(product))
    const success = await addToCart(productCopy, quantity)
    if (success) {
      openCart()
      setQuantity(1)
    }
  }

  const handleBuyNow = async () => {
    // No inventory field in schema, remove check
    const productCopy = JSON.parse(JSON.stringify(product))
    const success = await addToCart(productCopy, quantity)
    if (success) {
      router.push('/checkout')
    }
  }

  const isOutOfStock = false // No inventory field in schema
  const isMaxQuantity = false // No inventory field in schema
  const isMinQuantity = quantity <= 1

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <div className={`fixed bottom-[64px] left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30 px-3 py-2 ${
      isVisible ? 'block' : 'hidden'
    }`}>
      {/* Compact Product Info Bar */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={product.thumbnailUrl || '/placeholder-product.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1">
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(Number(product.basePrice), (product as any).currency || DEFAULT_CURRENCY)}
              </span>
              {/* No discount price field in schema */}
            </div>
          </div>
        </div>

        {/* Compact Quantity Selector */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg ml-2">
          <button 
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isMinQuantity || isLoading}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-gray-900 bg-gray-50 border-x border-gray-300">
            {quantity}
          </div>
          <button 
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isMaxQuantity || isLoading}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Compact Action Buttons */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          disabled={isOutOfStock || isLoading}
          onClick={handleAddToCart}
          className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-md"
        >
          <ShoppingCartIcon className="h-4 w-4 mr-1" />
          {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          size="sm"
          disabled={isOutOfStock || isLoading}
          onClick={handleBuyNow}
          className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm rounded-lg shadow-md"
        >
          {isOutOfStock ? 'Unavailable' : 'Buy Now'}
        </Button>
      </div>


    </div>
  )
}