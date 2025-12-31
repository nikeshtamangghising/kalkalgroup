'use client'

import { memo } from 'react'
import Link from 'next/link'

type GalleryLayout = 'feature' | 'tall' | 'wide' | 'standard'

const galleryItems: {
  title: string
  description: string
  image: string
  layout?: GalleryLayout
}[] = [
  {
    title: 'Seed Selection',
    description: 'Handpicked mustard seeds sourced directly from trusted partner farms.',
    image: '/oilpreperation/rawmaterial.jpeg',
    layout: 'feature',
  },
  {
    title: 'Machine Press',
    description: 'Traditional machine presses coax out rich flavours without overheating.',
    image: '/oilpreperation/machinepress.png',
  },
  {
    title: 'First Filtration',
    description: 'Gravity-fed silk filters remove husk particles while preserving nutrients.',
    image: '/oilpreperation/Oilfiltering.png',
    layout: 'tall',
  },
  {
    title: 'Warm Bottling',
    description: 'Freshly pressed oil is filled into sterilised glass jars in small batches.',
    image: '/oilpreperation/Oil being filled into jars.png',
    layout: 'wide',
  },
  {
    title: 'Protective Packaging',
    description: 'Each bottle is sealed, date-stamped, and packed with food-safe cushioning.',
    image: '/oilpreperation/packaging with saftey .png',
  },
  {
    title: 'Brand Assurance',
    description: 'Quality badges and holograms guarantee authenticity and batch traceability.',
    image: '/oilpreperation/sticker the brand and quality in bottel.jpeg',
  },
  {
    title: 'Zero-Waste Upcycling',
    description: 'Pressed seed cake is reused as organic cattle feed and natural fertiliser.',
    image: '/oilpreperation/wastematerial.png',
  },
]

const formatImagePath = (path: string) => encodeURI(path)

const layoutClassMap: Record<GalleryLayout, string> = {
  feature:
    'col-span-12 md:col-span-8 lg:col-span-6 row-span-3 min-h-[260px]',
  tall:
    'col-span-6 md:col-span-4 lg:col-span-3 row-span-3 min-h-[260px]',
  wide:
    'col-span-12 md:col-span-6 lg:col-span-6 row-span-2 min-h-[220px]',
  standard:
    'col-span-6 md:col-span-4 lg:col-span-3 row-span-2 min-h-[220px]',
}

const GalleryPreview = memo(() => {
  return (
    <section className="relative bg-[#FAF9F6] py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#FFF2CC] via-transparent to-transparent opacity-70" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#E1F2E1] via-transparent to-transparent opacity-70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-[#2D5A27] text-sm font-semibold shadow-sm mb-4">
            See Our Journey
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4">From Field to Bottle</h2>
          <p className="text-lg text-[#5A5A5A] max-w-2xl mx-auto">
            A glimpse of the people, craft, and care behind every Kal Kal product.
          </p>
        </div>

        <div className="grid grid-cols-12 grid-flow-dense gap-4 sm:gap-5 lg:gap-6 auto-rows-[90px] sm:auto-rows-[110px] lg:auto-rows-[130px]">
          {galleryItems.map((item, index) => (
            <div
              key={item.title}
              className={`group relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#0f1e13] shadow-[0_18px_35px_rgba(4,26,13,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(4,26,13,0.45)] ${
                layoutClassMap[item.layout ?? 'standard']
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${formatImagePath(item.image)})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 via-black/10 to-transparent opacity-80" />
              <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur">
                Step {index + 1}
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-2">Kal Kal</p>
                <p className="text-2xl font-semibold leading-tight drop-shadow-lg">{item.title}</p>
                <p className="mt-3 text-sm text-white/85 line-clamp-3 tracking-wide">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/gallery"
            className="inline-flex items-center px-8 py-4 bg-white text-[#1B4332] font-semibold rounded-full border border-[#F2E2B5] shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
          >
            View Full Gallery
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
})

GalleryPreview.displayName = 'GalleryPreview'

export default GalleryPreview
