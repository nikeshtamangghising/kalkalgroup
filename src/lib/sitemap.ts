import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'

export interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // Static pages
  const staticPages = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'never' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'never' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  sitemap.push(...staticPages)

  try {
    // Add product pages - simplified for now
    // TODO: Implement proper product pages when products are available
    const productPages: any[] = []

    sitemap.push(...productPages)

    // Get all categories - simplified for now
    // TODO: Implement proper category fetching when ProductRepository is fully functional
    const categories: string[] = []
    
    // Add category pages
    const categoryPages = categories.map(category => ({
      url: `${SITE_URL}/products?category=${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    sitemap.push(...categoryPages)

  } catch (_error) {
    // Continue with static pages even if dynamic content fails
  }

  return sitemap
}

export function generateRobotsTxt(): string {
  const robotsContent = `User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /checkout/
Disallow: /cart/
Disallow: /orders/

# Allow product and category pages
Allow: /products/
Allow: /categories/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`

  return robotsContent
}

export async function generateProductSitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  try {
    // Add product pages - simplified for now
    // TODO: Implement proper product pages when products are available
    const productPages: any[] = []

    sitemap.push(...productPages)
  } catch (_error) {
  }

  return sitemap
}

export async function generateCategorySitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  try {
    const categories: string[] = []
    
    const categoryPages = categories.map(category => ({
      url: `${SITE_URL}/products?category=${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    sitemap.push(...categoryPages)
  } catch (_error) {
  }

  return sitemap
}

// Utility function to validate sitemap entries
export function validateSitemapEntry(entry: SitemapEntry): boolean {
  try {
    new URL(entry.url)
    
    if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
      return false
    }
    
    if (entry.changeFrequency && !['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(entry.changeFrequency)) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Function to split large sitemaps into multiple files
export function splitSitemap(entries: SitemapEntry[], maxEntries: number = 50000): SitemapEntry[][] {
  const chunks: SitemapEntry[][] = []
  
  for (let i = 0; i < entries.length; i += maxEntries) {
    chunks.push(entries.slice(i, i + maxEntries))
  }
  
  return chunks
}