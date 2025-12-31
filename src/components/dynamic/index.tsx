// Dynamic imports for code splitting and lazy loading
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import Loading from '@/components/ui/loading'

// Loading component for dynamic imports
const DynamicLoading = () => <Loading size="lg" />

// Error boundary for dynamic components
// Note: This component is available but not currently used

// Wrapper function to add error handling to dynamic imports
const dynamicWithErrorHandling = <
  T extends ComponentType<any> = ComponentType<any>
>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: () => JSX.Element
    ssr?: boolean
    suspense?: boolean
  } = {}
) => {
  const WrappedImport = () => importFn().catch(error => {
    console.error('Dynamic import failed:', error)
    
    // Check if this is the specific "call" error we're trying to catch
    if (error?.message?.includes("Cannot read properties of undefined (reading 'call')")) {
      console.warn('Detected "call" error, reloading page');
      window.location.reload();
      // Return a minimal component while page reloads
      return {
        default: () => <div />
      };
    }
    
    // Return a component that shows an error and offers reload
    return {
      default: () => (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">Failed to load component</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )
    }
  })

  return dynamic(WrappedImport, {
    loading: options.loading || DynamicLoading,
    ssr: options.ssr !== false, // Default to true unless explicitly set to false
  })
}

// Admin components (heavy, only load when needed)
export const DynamicAdminLayout = dynamicWithErrorHandling(
  () => import('@/components/admin/admin-layout'),
  {
    loading: DynamicLoading,
    ssr: false, // Admin components don't need SSR
  }
)

// Note: ProductForm was removed due to schema issues

// Checkout components (only needed on checkout flow)
export const DynamicCheckoutForm = dynamicWithErrorHandling(
  () => import('@/components/checkout/checkout-form'),
  {
    loading: DynamicLoading,
  }
)


// Cart components (frequently used but can be lazy loaded)
export const DynamicCartSidebar = dynamicWithErrorHandling(
  () => import('@/components/cart/cart-sidebar'),
  {
    loading: () => <div className="w-96 h-screen bg-gray-100 animate-pulse" />,
  }
)

// Modal components (only load when opened)
export const DynamicModal = dynamicWithErrorHandling(
  () => import('@/components/ui/modal'),
  {
    loading: () => <div />, // Empty div instead of null to satisfy type requirements
    ssr: false,
  }
)







// Utility function to create dynamic component with custom loading
export function createDynamicComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: () => JSX.Element
    ssr?: boolean
    suspense?: boolean
  } = {}
) {
  return dynamicWithErrorHandling(importFn, {
    loading: options.loading,
    ssr: options.ssr,
  })
}

// Preload critical dynamic components
export function preloadCriticalComponents(): void {
  if (typeof window === 'undefined') return

  // Only preload if user is likely to use these components
  const shouldPreload = () => {
    // Check if user is on a page where these components might be used
    const path = window.location.pathname
    return path.includes('/cart') || path.includes('/product') || path.includes('/admin')
  }

  if (!shouldPreload()) return

  // Preload components that are likely to be used soon
  const criticalComponents = [
    () => import('@/components/cart/cart-sidebar'),
    () => import('@/components/ui/modal'),
  ]

  criticalComponents.forEach(importFn => {
    // Preload with low priority and only after a delay
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFn().catch(() => {
          // Ignore preload errors
        })
      }, { timeout: 5000 })
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Ignore preload errors
        })
      }, 3000)
    }
  })
}

// Component lazy loading with intersection observer
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: () => JSX.Element
) {
  return dynamicWithErrorHandling(importFn, {
    loading: fallback || DynamicLoading,
    ssr: false,
  })
}