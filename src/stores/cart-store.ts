import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: string) => number
}

// Custom storage with migration
const customStorage: StateStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name)
    if (!item) return null

    try {
      JSON.parse(item)
      return item
    } catch (_error) {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1) => {
        // Create a deep copy of the product to avoid reference issues
        const productCopy = JSON.parse(JSON.stringify(product))

        set((state) => {
          // Make sure we're using the correct product ID
          const productId = productCopy.id

          const existingItemIndex = state.items.findIndex(item => item.productId === productId)

          if (existingItemIndex !== -1) {
            // Update quantity of existing item
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            }
            return { items: updatedItems }
          } else {
            // Add new item
            const newItem = {
              productId: productId,
              quantity,
              product: productCopy
            }
            return { items: [...state.items, newItem] }
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => {
          const itemIndex = state.items.findIndex(item => item.productId === productId)

          if (itemIndex !== -1) {
            const updatedItems = [...state.items]
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              quantity
            }
            return { items: updatedItems }
          }

          return { items: state.items }
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = Number(item.product.discountPrice || item.product.price)
          return total + (price * item.quantity)
        }, 0)
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.productId === productId)
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
      onRehydrateStorage: () => (_state) => {
        // Cart store hydrated
      },
      migrate: (persistedState: unknown, _version: number) => {
        type PersistedState = {
          items?: Array<Partial<CartItem> & { product?: Product }>
        }

        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState
        }

        // Ensure items array is properly structured
        const typedState = persistedState as PersistedState

        if (typedState.items) {
          // Fix any potential reference issues
          const fixedItems = typedState.items.map((item) => {
            const hasProduct = item?.product && typeof item.product === 'object'
            if (hasProduct) {
              // Create a deep copy to ensure no reference issues
              const fixedProduct = JSON.parse(JSON.stringify(item.product))
              return {
                ...item,
                product: fixedProduct,
                productId: item.productId || fixedProduct.id
              }
            }
            return item
          })
          return {
            ...typedState,
            items: fixedItems
          }
        }
        return persistedState
      }
    }
  )
)