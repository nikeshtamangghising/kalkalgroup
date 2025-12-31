'use client'

import { memo, Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react'
import MainLayout from '@/components/layout/main-layout'

// Error boundary for dynamic components
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class DynamicComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Dynamic component error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dynamic component error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center py-8 text-red-500">Failed to load dynamic content. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

const HeroSection = lazy(() => import('./hero-section'))
const TrustBar = lazy(() => import('./trust-bar'))
const ProductPreview = lazy(() => import('./product-preview'))
const WhyKalSection = lazy(() => import('./why-kal-section'))
const AboutPreview = lazy(() => import('./about-preview'))
const GalleryPreview = lazy(() => import('./gallery-preview'))
const CTASection = lazy(() => import('./cta-section'))

// Loading skeleton component
const HomepageSkeleton = memo(() => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-3xl p-8 md:p-12 lg:p-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex-1 mb-8 lg:mb-0 lg:pr-12">
            <div className="animate-pulse">
              <div className="h-6 bg-white/20 rounded-full w-32 mb-6" />
              <div className="h-12 bg-white/20 rounded w-96 mb-4" />
              <div className="h-12 bg-white/20 rounded w-80 mb-6" />
              <div className="h-6 bg-white/20 rounded w-full max-w-lg mb-8" />
              <div className="flex gap-4">
                <div className="h-12 bg-white/20 rounded-full w-32" />
                <div className="h-12 bg-white/20 rounded-full w-40" />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Content Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4" />
          <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
))

HomepageSkeleton.displayName = 'HomepageSkeleton'

const HomepageClient = memo(() => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <Suspense fallback={<HomepageSkeleton />}>
          <DynamicComponentErrorBoundary>
            <HeroSection />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* Trust Bar */}
        <Suspense fallback={<div className="animate-pulse h-24 bg-green-50 mx-4 rounded-2xl" />}>
          <DynamicComponentErrorBoundary>
            <TrustBar />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* Product Preview */}
        <Suspense fallback={<div className="animate-pulse h-[32rem] bg-white mx-4 my-8 rounded-[32px]" />}>
          <DynamicComponentErrorBoundary>
            <ProductPreview />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* Why Kal Kal */}
        <Suspense fallback={<div className="animate-pulse h-80 bg-gray-50 rounded-3xl mx-4 my-8" />}>
          <DynamicComponentErrorBoundary>
            <WhyKalSection />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* About Preview */}
        <Suspense fallback={<div className="animate-pulse h-[28rem] bg-white rounded-[32px] mx-4" />}>
          <DynamicComponentErrorBoundary>
            <AboutPreview />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* Gallery Preview */}
        <Suspense fallback={<div className="animate-pulse h-[22rem] bg-gray-100 rounded-[32px] mx-4" />}>
          <DynamicComponentErrorBoundary>
            <GalleryPreview />
          </DynamicComponentErrorBoundary>
        </Suspense>

        {/* CTA */}
        <Suspense fallback={<div className="animate-pulse h-80 bg-[#1B4332]/40 rounded-[32px] mx-4 text-white" />}>
          <DynamicComponentErrorBoundary>
            <CTASection />
          </DynamicComponentErrorBoundary>
        </Suspense>
      </div>
    </MainLayout>
  )
})

HomepageClient.displayName = 'HomepageClient'

export default HomepageClient
