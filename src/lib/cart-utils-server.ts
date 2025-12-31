import { CartItem } from '@/types'
import { formatCurrency, DEFAULT_CURRENCY } from './currency'
import { SettingsRepository } from './settings-repository'

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = typeof item.product.discountPrice === 'string' 
      ? parseFloat(item.product.discountPrice) 
      : (item.product.discountPrice ?? (typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price) ?? 0)
    return total + (price * item.quantity)
  }, 0)
}

export function calculateCartItemsCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function formatPrice(price: number, currency: string = DEFAULT_CURRENCY): string {
  return formatCurrency(price, currency)
}

// Async version that uses configurable settings from the database
// This ensures shipping costs and thresholds are always synced with admin settings
export async function getCartSummaryWithSettings(items: CartItem[]) {
  const subtotal = calculateCartTotal(items)
  const itemsCount = calculateCartItemsCount(items)
  
  // Get configurable settings
  const freeShippingThreshold = await SettingsRepository.getValue('free_shipping_threshold', 200)
  const shippingRate = await SettingsRepository.getValue('shipping_rate', 200)
  const taxRate = await SettingsRepository.getValue('tax_rate', 0.13)
  
  // Calculate shipping
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingRate
  
  // Calculate tax
  const tax = subtotal * taxRate
  
  const total = subtotal + shipping + tax
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemsCount,
    freeShippingThreshold,
    shippingRate,
    taxRate,
    currency: DEFAULT_CURRENCY
  }
}
