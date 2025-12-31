'use client'

import { memo, Suspense, lazy, ComponentType } from 'react'

interface ComponentLoaderProps {
  componentName: string
  fallback?: React.ReactNode
  props?: Record<string, any>
}

// Dynamic component registry
const componentRegistry: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  // Admin components
  'admin-dashboard': () => import('@/components/admin/admin-dashboard-content'),
  'admin-products': () => import('@/components/admin/admin-products-tab'),
  'admin-orders': () => import('@/components/admin/admin-orders-tab'),
  'admin-customers': () => import('@/components/admin/admin-customers-tab'),
  'admin-analytics': () => import('@/components/admin/admin-analytics-tab'),
  
  // Product components
  'product-modal': () => import('@/components/products/product-modal'),
  'product-reviews': () => import('@/components/products/product-reviews'),
  'review-form': () => import('@/components/products/review-form'),
  
  // Cart components
  'checkout-form': () => import('@/components/checkout/checkout-form'),
  'order-summary': () => import('@/components/checkout/order-summary'),
  
  // Search components
  'search-autocomplete': () => import('@/components/search/search-autocomplete'),
  'mobile-search-modal': () => import('@/components/search/mobile-search-modal'),
  
  // Account components
  'profile-form': () => import('@/components/account/profile-form'),
  'order-history': () => import('@/components/account/order-history'),
  'address-book': () => import('@/components/account/address-book'),
}

// Add error handling for component loading
const createSafeComponentLoader = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  return () => loader().catch(error => {
    console.error('Failed to load component:', error)
    
    // Check if this is the specific "call" error we're trying to catch
    if (error?.message?.includes("Cannot read properties of undefined (reading 'call')")) {
      console.warn('Detected "call" error in component loader, reloading page');
      window.location.reload();
      // Return a minimal component while page reloads
      return { default: () => <div /> };
    }
    
    // Return a fallback component in case of loading error
    return { default: () => <div>Component failed to load</div> }
  })
}

const ComponentLoader = memo(({ 
  componentName, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  props = {}
}: ComponentLoaderProps) => {
  const componentLoader = componentRegistry[componentName]
  
  if (!componentLoader) {
    console.warn(`Component "${componentName}" not found in registry`)
    return <div>Component not found</div>
  }

  // Wrap the loader with error handling
  const safeLoader = createSafeComponentLoader(componentLoader)
  const LazyComponent = lazy(safeLoader)

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
})

ComponentLoader.displayName = 'ComponentLoader'

export default ComponentLoader