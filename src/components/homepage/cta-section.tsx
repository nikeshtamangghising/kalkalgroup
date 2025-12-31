'use client'

import Link from 'next/link'
import { memo } from 'react'

const CTASection = memo(() => {
  return (
    <section className="relative bg-gradient-to-br from-[#1B4332] via-[#163828] to-[#0F261B] text-white py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 right-0 w-96 h-96 bg-[#E6B800]/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-10 w-[28rem] h-[28rem] bg-[#2D5A27]/40 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-[#F8E8B0] text-sm font-semibold tracking-[0.25em] uppercase mb-8">
          Experience Kal Kal
        </p>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Pure Nepali goodness, from our factory to your kitchen.
        </h2>
        <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto">
          Taste the difference of transparent sourcing, farmer partnerships, and stone-pressed craft.
          Your kitchen deserves products that are honest, soulful, and proudly Nepali.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 rounded-full bg-white text-[#1B4332] font-semibold shadow-[0_20px_60px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Shop Now
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
            </svg>
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  )
})

CTASection.displayName = 'CTASection'

export default CTASection
