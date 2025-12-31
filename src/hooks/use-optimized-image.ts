'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseOptimizedImageOptions {
  src: string
  fallbackSrc?: string
  preload?: boolean
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
}

interface UseOptimizedImageReturn {
  src: string
  isLoading: boolean
  hasError: boolean
  retry: () => void
}

export function useOptimizedImage({
  src,
  fallbackSrc = '/placeholder-product.svg',
  preload = false,
  quality = 85,
}: UseOptimizedImageOptions): UseOptimizedImageReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 3

  // Generate optimized image URL
  const generateOptimizedUrl = useCallback((originalSrc: string) => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc
    }

    // If it's already a Next.js optimized image, return as is
    if (originalSrc.includes('/_next/image')) {
      return originalSrc
    }

    // For external images or when we want to optimize
    const url = new URL('/_next/image', window.location.origin)
    url.searchParams.set('url', originalSrc)
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('w', '800') // Default width, can be made configurable

    return url.toString()
  }, [quality])

  // Load image with error handling and retries
  const loadImage = useCallback((imageSrc: string) => {
    setIsLoading(true)
    setHasError(false)

    const img = new Image()
    imageRef.current = img

    img.onload = () => {
      setIsLoading(false)
      setHasError(false)
      retryCount.current = 0
    }

    img.onerror = () => {
      setIsLoading(false)
      
      if (retryCount.current < maxRetries) {
        retryCount.current += 1
        // Retry with a delay
        setTimeout(() => {
          loadImage(imageSrc)
        }, 1000 * retryCount.current)
      } else if (imageSrc !== fallbackSrc) {
        // Try fallback image
        setOptimizedSrc(fallbackSrc)
        retryCount.current = 0
        loadImage(fallbackSrc)
      } else {
        setHasError(true)
      }
    }

    img.src = imageSrc
  }, [fallbackSrc])

  // Retry function
  const retry = useCallback(() => {
    retryCount.current = 0
    const newSrc = generateOptimizedUrl(src)
    setOptimizedSrc(newSrc)
    loadImage(newSrc)
  }, [src, generateOptimizedUrl, loadImage])

  // Initialize image loading
  useEffect(() => {
    const newSrc = generateOptimizedUrl(src)
    setOptimizedSrc(newSrc)
    
    if (preload) {
      loadImage(newSrc)
    }
  }, [src, generateOptimizedUrl, loadImage, preload])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null
        imageRef.current.onerror = null
      }
    }
  }, [])

  return {
    src: optimizedSrc,
    isLoading,
    hasError,
    retry
  }
}

// Hook for image preloading
export function useImagePreloader() {
  const preloadedImages = useRef<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve()
        return
      }

      const img = new Image()
      
      img.onload = () => {
        preloadedImages.current.add(src)
        resolve()
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      img.src = src
    })
  }, [])

  const preloadImages = useCallback(async (sources: string[]) => {
    try {
      await Promise.all(sources.map(preloadImage))
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }, [preloadImage])

  return { preloadImage, preloadImages }
}

// Hook for responsive image sources
export function useResponsiveImage(baseSrc: string) {
  const [currentSrc, setCurrentSrc] = useState(baseSrc)

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth
      let size = '800'

      if (width <= 640) {
        size = '400'
      } else if (width <= 768) {
        size = '600'
      } else if (width <= 1024) {
        size = '800'
      } else {
        size = '1200'
      }

      const url = new URL('/_next/image', window.location.origin)
      url.searchParams.set('url', baseSrc)
      url.searchParams.set('w', size)
      url.searchParams.set('q', '85')

      setCurrentSrc(url.toString())
    }

    updateImageSrc()

    const debouncedUpdate = debounce(updateImageSrc, 250)
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [baseSrc])

  return currentSrc
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}