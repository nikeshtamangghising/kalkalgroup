// Global chunk loading error handler
export function setupChunkErrorHandler() {
  if (typeof window === 'undefined') return

  // Handle chunk loading errors
  window.addEventListener('unhandledrejection', (event) => {
    // Check for various types of chunk loading errors
    const errorMessage = event.reason?.message || ''
    const errorCode = event.reason?.code || ''
    
    if (errorMessage.includes('Loading chunk') || 
        errorMessage.includes('chunk') ||
        errorCode === 'CHUNK_LOAD_ERROR' ||
        errorMessage.includes("Cannot read properties of undefined (reading 'call')") ||
        (errorMessage.includes('undefined') && errorMessage.includes('call'))) {
      console.warn('Chunk loading error detected, reloading page:', event.reason)
      event.preventDefault()
      window.location.reload()
      return
    }
    
    // Also check for promise rejection with no reason
    if (!event.reason) {
      console.warn('Unhandled promise rejection with no reason, reloading page')
      event.preventDefault()
      window.location.reload()
    }
  })

  // Handle regular errors that might be chunk-related
  window.addEventListener('error', (event) => {
    // Check for chunk-related errors including the specific "call" error
    const errorMessage = event.error?.message || ''
    
    if (errorMessage.includes('Loading chunk') ||
        errorMessage.includes('chunk') ||
        errorMessage.includes("Cannot read properties of undefined (reading 'call')") ||
        (errorMessage.includes('undefined') && errorMessage.includes('call'))) {
      console.warn('Chunk error detected, reloading page:', event.error)
      event.preventDefault()
      window.location.reload()
    }
  })
}

// Retry function for failed chunk loads
export function retryChunkLoad(chunkName: string, maxRetries = 3): Promise<any> {
  return new Promise((_resolve, reject) => {
    let retries = 0
    
    const attemptLoad = () => {
      retries++
      
      // Clear the chunk from cache to force reload
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('next')) {
              caches.open(cacheName).then(cache => {
                cache.keys().then(requests => {
                  requests.forEach(request => {
                    if (request.url.includes(chunkName)) {
                      cache.delete(request)
                    }
                  })
                })
              })
            }
          })
        })
      }
      
      // Try to reload the page
      if (retries <= maxRetries) {
        setTimeout(() => {
          window.location.reload()
        }, 1000 * retries) // Exponential backoff
      } else {
        reject(new Error(`Failed to load chunk ${chunkName} after ${maxRetries} retries`))
      }
    }
    
    attemptLoad()
  })
}