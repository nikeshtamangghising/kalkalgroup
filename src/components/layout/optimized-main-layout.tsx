'use client'

import { memo, Suspense, lazy } from 'react'
import { ReactNode } from 'react'
import Header from './header'
import Footer from './footer'
import { CartProvider } from '@/contexts/cart-context'

// Lazy load heavy components
const MobileBottomNav = lazy(() => import('./mobile-bottom-nav'))
const CartSidebar = lazy(() => import('@/components/cart/cart-sidebar'))

interface OptimizedMainLayoutProps {
  children: ReactNode
}

const OptimizedMainLayout = memo(({ children }: OptimizedMainLayoutProps) => {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        
        {/* Lazy load mobile navigation and cart sidebar */}
        <Suspense fallback={null}>
          <MobileBottomNav />
          <CartSidebar />
        </Suspense>
      </div>
    </CartProvider>
  )
})

OptimizedMainLayout.displayName = 'OptimizedMainLayout'

export default OptimizedMainLayout