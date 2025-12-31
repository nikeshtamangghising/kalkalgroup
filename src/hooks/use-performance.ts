'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1
  })

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    if (renderTime > 16) { // Log slow renders (>16ms)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`)
    }
  })

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = performance.now()
    }
  }
}

// Hook for intersection observer with performance optimizations
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setElement = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current)
    }

    elementRef.current = element

    if (element) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting)
            setEntry(entry)
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
          }
        )
      }
      observerRef.current.observe(element)
    }
  }, [options])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { isIntersecting, entry, setElement }
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now()
          callback(...args)
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Hook for measuring loading states
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0)
  const [loadingDuration, setLoadingDuration] = useState<number>(0)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setLoadingStartTime(performance.now())
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    const duration = performance.now() - loadingStartTime
    setLoadingDuration(duration)
  }, [loadingStartTime])

  return {
    isLoading,
    loadingDuration,
    startLoading,
    stopLoading
  }
}

// Hook for viewport size with performance optimizations
export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 100) // Throttle resize events
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return size
}

// Hook for prefetching resources
export function usePrefetch() {
  const prefetchedUrls = useRef<Set<string>>(new Set())

  const prefetch = useCallback((url: string, type: 'image' | 'script' | 'style' = 'image') => {
    if (prefetchedUrls.current.has(url)) return

    prefetchedUrls.current.add(url)

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    
    if (type === 'image') {
      link.as = 'image'
    } else if (type === 'script') {
      link.as = 'script'
    } else if (type === 'style') {
      link.as = 'style'
    }

    document.head.appendChild(link)
  }, [])

  return { prefetch }
}