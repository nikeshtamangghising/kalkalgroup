'use client'

import { memo, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'

type PreviewProduct = {
  id: string
  name: string
  description: string
  image: string
  price?: number | null
  currency?: string | null
}

const FALLBACK_PRODUCTS: PreviewProduct[] = [
  {
    id: 'fallback-1',
    name: 'Flagship Mustard Oil',
    description: 'Stone-pressed, factory fresh mustard oil with an unforgettable aroma.',
    image: '/banner.jpg',
    price: 1199,
    currency: 'NPR',
  },
  {
    id: 'fallback-2',
    name: 'Heritage Daal',
    description: 'Protein-rich Nepali daal sourced directly from the Terai.',
    image: '/banner.jpg',
    price: 499,
    currency: 'NPR',
  },
  {
    id: 'fallback-3',
    name: 'Golden Grains',
    description: 'Handpicked grains with perfect texture for every Nepali kitchen.',
    image: '/banner.jpg',
    price: 699,
    currency: 'NPR',
  },
  {
    id: 'fallback-4',
    name: 'Stone-Ground Flour',
    description: 'Slow-milled flour that keeps the nutrients and nostalgia intact.',
    image: '/banner.jpg',
    price: 549,
    currency: 'NPR',
  },
  {
    id: 'fallback-5',
    name: 'Herbal Infused Ghee',
    description: 'Slow-clarified ghee infused with Himalayan herbs for immunity.',
    image: '/banner.jpg',
    price: 899,
    currency: 'NPR',
  },
  {
    id: 'fallback-6',
    name: 'Organic Buckwheat',
    description: 'High-altitude buckwheat packed with minerals and rich flavor.',
    image: '/banner.jpg',
    price: 649,
    currency: 'NPR',
  },
]

const ProductPreview = memo(() => {
  const [products, setProducts] = useState<PreviewProduct[]>(FALLBACK_PRODUCTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?page=1&limit=6&isActive=true', {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const payload = await response.json()
        if (payload?.data && Array.isArray(payload.data)) {
          const mapped: PreviewProduct[] = payload.data.slice(0, 6).map((product: any, index: number) => ({
            id: product.id ?? `product-${index}`,
            name: product.name ?? 'Kal Kal Product',
            description:
              product.shortDescription ??
              product.description?.slice(0, 110) ??
              'Pure Nepali ingredients made with love.',
            image:
              (Array.isArray(product.images) && product.images[0]) ||
              product.image ||
              '/banner.jpg',
            price: product.discountPrice ?? product.price ?? null,
            currency: product.currency ?? DEFAULT_CURRENCY,
          }))

          if (isMounted && mapped.length) {
            setProducts(mapped)
          }
        }
      } catch (error) {
        console.warn('[ProductPreview] Falling back to presets:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return (
    <section className="relative bg-white py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/4 w-48 h-48 bg-[#F8EDD0] blur-3xl rounded-full opacity-70" />
        <div className="absolute bottom-0 right-12 w-64 h-64 bg-[#F2F8F0] blur-3xl rounded-full opacity-70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFF6E1] text-[#8B4513] text-sm font-semibold mb-4">
            Crafted with care
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4">
            Our Pure Products
          </h2>
          <p className="text-lg md:text-xl text-[#5A5A5A] max-w-3xl mx-auto">
            Mustard oil, daal, grains &amp; natural products—curated to keep your family close to authentic Nepali flavors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="group bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-[#F2EAD7] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_65px_rgba(0,0,0,0.1)]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div
                className="relative h-72 overflow-hidden"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25 transition-opacity duration-500 group-hover:opacity-60" />
                <div className="absolute top-4 left-4 bg-white/90 text-[#1B4332] text-xs font-semibold tracking-wide px-3 py-1 rounded-full shadow">
                  Pure &amp; Fresh
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1B4332] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-[#5A5A5A] mb-6 min-h-[60px]">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  {product.price ? (
                    <p className="text-2xl font-bold text-[#D4A017]">
                      {formatCurrency(product.price, product.currency ?? DEFAULT_CURRENCY)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-[#8B4513]">Seasonal Batch</p>
                  )}
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1B4332] text-white transition-transform duration-300 group-hover:bg-[#D4A017] group-hover:text-[#1B4332]"
                    aria-label={`View ${product.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-[#D4A017] text-[#1B4332] font-semibold rounded-full shadow-[0_12px_35px_rgba(212,160,23,0.45)] hover:bg-[#E6B800] hover:-translate-y-0.5 transition-all duration-300"
          >
            View All in Shop
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xs animate-pulse pointer-events-none rounded-t-[48px]" aria-hidden="true" />
      )}
    </section>
  )
})

ProductPreview.displayName = 'ProductPreview'

export default ProductPreview
