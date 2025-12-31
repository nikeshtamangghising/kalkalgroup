'use client'

import { memo, useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

interface PerformanceMonitorProps {
  enabled?: boolean
  onMetrics?: (metrics: Partial<PerformanceMetrics>) => void
}

const PerformanceMonitor = memo(({ 
  enabled = process.env.NODE_ENV === 'development',
  onMetrics 
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Safe wrapper for performance measurement functions
    const safeMeasure = (fn: () => void, errorMsg: string) => {
      try {
        fn()
      } catch (error) {
        console.warn(errorMsg, error)
      }
    }

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      try {
        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
        if (fcpEntry) {
          const fcp = fcpEntry.startTime
          setMetrics(prev => ({ ...prev, fcp }))
          onMetrics?.({ fcp })
        }

        // Time to First Byte
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
          setMetrics(prev => ({ ...prev, ttfb }))
          onMetrics?.({ ttfb })
        }
      } catch (error) {
        console.warn('Error measuring web vitals:', error)
      }
    }

    // Largest Contentful Paint
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as PerformanceEntry
            if (lastEntry) {
              const lcp = lastEntry.startTime
              setMetrics(prev => ({ ...prev, lcp }))
              onMetrics?.({ lcp })
            }
          } catch (error) {
            console.warn('Error in LCP observer callback:', error)
          }
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        return observer
      } catch (error) {
        console.warn('Error setting up LCP observer:', error)
        return { disconnect: () => {} }
      }
    }

    // First Input Delay
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              const fid = entry.processingStart - entry.startTime
              setMetrics(prev => ({ ...prev, fid }))
              onMetrics?.({ fid })
            })
          } catch (error) {
            console.warn('Error in FID observer callback:', error)
          }
        })
        observer.observe({ entryTypes: ['first-input'] })
        return observer
      } catch (error) {
        console.warn('Error setting up FID observer:', error)
        return { disconnect: () => {} }
      }
    }

    // Cumulative Layout Shift
    const observeCLS = () => {
      try {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
                setMetrics(prev => ({ ...prev, cls: clsValue }))
                onMetrics?.({ cls: clsValue })
              }
            })
          } catch (error) {
            console.warn('Error in CLS observer callback:', error)
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
        return observer
      } catch (error) {
        console.warn('Error setting up CLS observer:', error)
        return { disconnect: () => {} }
      }
    }

    // Initialize measurements
    safeMeasure(measureWebVitals, 'Error initializing web vitals measurement:')
    const lcpObserver = observeLCP()
    const fidObserver = observeFID()
    const clsObserver = observeCLS()

    // Cleanup observers
    return () => {
      try {
        lcpObserver?.disconnect()
        fidObserver?.disconnect()
        clsObserver?.disconnect()
      } catch (error) {
        console.warn('Error cleaning up performance observers:', error)
      }
    }
  }, [enabled, onMetrics])

  // Log metrics in development
  useEffect(() => {
    if (enabled && Object.keys(metrics).length > 0) {
      console.group('🚀 Performance Metrics')
      if (metrics.fcp) console.log(`First Contentful Paint: ${metrics.fcp.toFixed(2)}ms`)
      if (metrics.lcp) console.log(`Largest Contentful Paint: ${metrics.lcp.toFixed(2)}ms`)
      if (metrics.fid) console.log(`First Input Delay: ${metrics.fid.toFixed(2)}ms`)
      if (metrics.cls) console.log(`Cumulative Layout Shift: ${metrics.cls.toFixed(4)}`)
      if (metrics.ttfb) console.log(`Time to First Byte: ${metrics.ttfb.toFixed(2)}ms`)
      console.groupEnd()
    }
  }, [metrics, enabled])

  // Don't render anything in production
  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      {metrics.fcp && (
        <div className={`mb-1 ${metrics.fcp > 2500 ? 'text-red-400' : metrics.fcp > 1800 ? 'text-yellow-400' : 'text-green-400'}`}>
          FCP: {metrics.fcp.toFixed(0)}ms
        </div>
      )}
      {metrics.lcp && (
        <div className={`mb-1 ${metrics.lcp > 4000 ? 'text-red-400' : metrics.lcp > 2500 ? 'text-yellow-400' : 'text-green-400'}`}>
          LCP: {metrics.lcp.toFixed(0)}ms
        </div>
      )}
      {metrics.fid && (
        <div className={`mb-1 ${metrics.fid > 300 ? 'text-red-400' : metrics.fid > 100 ? 'text-yellow-400' : 'text-green-400'}`}>
          FID: {metrics.fid.toFixed(0)}ms
        </div>
      )}
      {metrics.cls && (
        <div className={`mb-1 ${metrics.cls > 0.25 ? 'text-red-400' : metrics.cls > 0.1 ? 'text-yellow-400' : 'text-green-400'}`}>
          CLS: {metrics.cls.toFixed(3)}
        </div>
      )}
      {metrics.ttfb && (
        <div className={`${metrics.ttfb > 800 ? 'text-red-400' : metrics.ttfb > 600 ? 'text-yellow-400' : 'text-green-400'}`}>
          TTFB: {metrics.ttfb.toFixed(0)}ms
        </div>
      )}
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

export default PerformanceMonitor