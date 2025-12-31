'use client'

import Link from 'next/link'
import {
  memo,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import MainLayout from '@/components/layout/main-layout'
import {
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface GalleryItem {
  id: string
  title: string
  category: string
  description: string | null
  imageUrl: string
  altText: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'Factory', label: 'Factory', emoji: '🏭' },
  { id: 'Production', label: 'Process', emoji: '⚙️' },
  { id: 'Products', label: 'Products', emoji: '📦' },
  { id: 'Team', label: 'Team', emoji: '👥' },
  { id: 'Farmers', label: 'Farmers', emoji: '🌾' },
  { id: 'Events', label: 'Events', emoji: '🎉' },
]

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80'

const ITEMS_PER_LOAD = 12

const GalleryClient = memo(() => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [modalLoaded, setModalLoaded] = useState(false)
  const bodyScrollY = useRef(0)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gallery?activeOnly=true')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch gallery items')
      }

      const normalized = (result.data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl || item.image_url || FALLBACK_IMAGE,
        altText: item.altText || item.alt_text || item.title,
        isActive: item.isActive ?? item.is_active ?? true,
        sortOrder: item.sortOrder ?? item.sort_order ?? 0,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at,
      }))

      setGalleryItems(normalized)
    } catch (err) {
      console.error('[Gallery] fetch error', err)
      setError('Unable to load gallery right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return galleryItems
    return galleryItems.filter(
      (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [galleryItems, selectedCategory])

  const displayedItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  )

  const progress = filteredItems.length
    ? Math.min(100, Math.round((displayedItems.length / filteredItems.length) * 100))
    : 0

  const hasMore = displayedItems.length < filteredItems.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD)
  }

  const openLightbox = useCallback((index: number) => {
    bodyScrollY.current = window.scrollY
    document.body.style.top = `-${bodyScrollY.current}px`
    document.body.style.position = 'fixed'
    setModalLoaded(false)
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    document.body.style.position = ''
    document.body.style.top = ''
    window.scrollTo(0, bodyScrollY.current)
  }, [])

  const navigateLightbox = useCallback(
    (direction: 'next' | 'prev') => {
      if (lightboxIndex === null) return
      const max = displayedItems.length
      if (!max) return
      const nextIndex =
        direction === 'next'
          ? (lightboxIndex + 1) % max
          : (lightboxIndex - 1 + max) % max
      setModalLoaded(false)
      setLightboxIndex(nextIndex)
    },
    [lightboxIndex, displayedItems.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      } else if (event.key === 'ArrowRight') {
        navigateLightbox('next')
      } else if (event.key === 'ArrowLeft') {
        navigateLightbox('prev')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, closeLightbox, navigateLightbox])

  const lightboxItem =
    lightboxIndex !== null ? displayedItems[lightboxIndex] : null

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAF9F6]">
        {/* Header */}
        <section className="relative overflow-hidden bg-[#FAF9F6]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#D4A017]/15 blur-3xl rounded-full" />
            <div className="absolute top-32 -left-24 w-64 h-64 bg-[#2D5A27]/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-t from-[#F5E3AC] to-transparent opacity-60" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="inline-flex items-center px-5 py-2 rounded-full bg-white text-[#2D5A27] text-sm font-semibold mb-6 shadow-sm">
              Our Journey in Pictures
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4 leading-tight">
              From Farm to Factory to Your Kitchen
            </h1>
            <p className="text-lg md:text-xl text-[#4F4F4F] max-w-3xl mx-auto">
              Explore how Kal Kal brings purity to life—peek into our fields,
              factory, team, and the moments that fuel our story of trust.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 md:top-20 z-20 bg-[#FAF9F6]/95 backdrop-blur supports-[backdrop-filter:blur(12px)] border-y border-[#F0EAD6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 min-w-max">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setVisibleCount(ITEMS_PER_LOAD)
                    }}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D4A017] text-[#1B4332] shadow-[0_12px_30px_rgba(212,160,23,0.35)]'
                        : 'bg-[#EDE8DC] text-[#5C5C5C] hover:bg-[#E3DAC3]'
                    }`}
                  >
                    <span>{category.emoji}</span>
                    {category.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* States */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[28px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-[#ECE4D3]" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-[#ECE4D3]" />
                    <div className="h-4 bg-[#ECE4D3] w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="text-center bg-white rounded-[32px] shadow-xl p-12 border border-[#F7E8B6]">
              <PhotoIcon className="w-12 h-12 text-[#D08A04] mx-auto mb-4" />
              <p className="text-xl font-semibold text-[#1B4332] mb-3">
                We couldn’t load the gallery.
              </p>
              <p className="text-[#5C5C5C] mb-6">
                {error} Please check your connection or try refreshing the page.
              </p>
              <button
                onClick={fetchGalleryItems}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#D4A017] text-[#1B4332] font-semibold shadow-[0_12px_30px_rgba(212,160,23,0.35)] hover:bg-[#E6B800]"
              >
                Reload Gallery
              </button>
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <PhotoIcon className="w-14 h-14 text-[#D08A04] mx-auto mb-4" />
              <p className="text-2xl font-semibold text-[#1B4332] mb-2">
                Nothing here yet
              </p>
              <p className="text-[#5C5C5C]">
                Try selecting a different category to explore more moments.
              </p>
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px] sm:auto-rows-[280px]">
                {displayedItems.map((item, index) => {
                  const tallCard = index % 5 === 0 || index % 7 === 0
                  return (
                    <article
                      key={item.id}
                      className={`relative rounded-[28px] shadow-[0_18px_45px_rgba(0,0,0,0.12)] overflow-hidden cursor-pointer group border border-[#F4E5B6] bg-white ${
                        tallCard ? 'row-span-2' : ''
                      }`}
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative h-full w-full">
                        <img
                          src={item.imageUrl || FALLBACK_IMAGE}
                          alt={item.altText || item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget
                            if (target.src !== FALLBACK_IMAGE) {
                              target.src = FALLBACK_IMAGE
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-4 py-1 rounded-full bg-white/90 text-[#1B4332] text-xs font-semibold uppercase tracking-wide shadow">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 text-white">
                          <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-white/80 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Load More */}
              <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-[#5C5C5C]">
                  Showing {Math.min(displayedItems.length, filteredItems.length)} of{' '}
                  {filteredItems.length} images
                </p>
                <div className="w-64 h-1.5 bg-[#E9E2CB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4A017] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    className="inline-flex items-center px-8 py-3 rounded-full border border-[#D4A017] text-[#1B4332] font-semibold bg-white hover:bg-[#FFF4D4] transition"
                  >
                    Load More Images
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-[#1B4332]">
                    You’ve seen every moment ✨
                  </p>
                )}
              </div>
            </>
          )}
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1B4332] via-[#173626] to-[#0c2217] text-white px-8 py-16 md:px-16 shadow-[0_25px_65px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 right-10 w-52 h-52 bg-[#E6B800]/20 blur-3xl rounded-full" />
            </div>
            <div className="relative text-center">
              <p className="uppercase tracking-[0.3em] text-sm text-[#F8E8B0] mb-4">
                Taste the Story
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to experience pure Nepali goodness?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                Visit our products or reach out to book a factory tour. We love
                showing how every drop is crafted with care.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/products"
                  className="px-8 py-4 rounded-full bg-white text-[#1B4332] font-semibold shadow-[0_18px_35px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition"
                >
                  View Products
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-full border border-white/50 text-white font-semibold hover:bg-white/10 transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightboxItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
              aria-label="Close gallery lightbox"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigateLightbox('prev')}
              className="absolute left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 hidden sm:flex"
              aria-label="View previous image"
            >
              ‹
            </button>
            <button
              onClick={() => navigateLightbox('next')}
              className="absolute right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 hidden sm:flex"
              aria-label="View next image"
            >
              ›
            </button>

            <div className="max-w-5xl w-full text-white">
              <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-black/30">
                <img
                  src={lightboxItem.imageUrl || FALLBACK_IMAGE}
                  alt={lightboxItem.altText || lightboxItem.title}
                  className={`w-full max-h-[70vh] object-contain transition-opacity duration-500 ${
                    modalLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setModalLoaded(true)}
                  onError={(e) => {
                    const target = e.currentTarget
                    if (target.src !== FALLBACK_IMAGE) {
                      target.src = FALLBACK_IMAGE
                    }
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-sm uppercase tracking-[0.2em]">
                  {lightboxItem.category}
                </span>
                <h3 className="mt-4 text-2xl font-semibold">{lightboxItem.title}</h3>
                <p className="mt-2 text-white/70 max-w-3xl mx-auto">
                  {lightboxItem.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">
                  {lightboxIndex! + 1} / {displayedItems.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
})

GalleryClient.displayName = 'GalleryClient'

export default GalleryClient