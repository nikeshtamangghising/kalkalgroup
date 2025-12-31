'use client'

import { memo } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, FireIcon } from '@heroicons/react/24/outline'

const heroHighlights = [
  { label: '100% Pure', icon: ShieldCheckIcon },
  { label: 'Made in Nepal', icon: SparklesIcon },
  { label: 'Factory Fresh', icon: FireIcon },
]

const HeroSection = memo(() => {
  return (
    <section className="relative overflow-hidden bg-[#FAF9F6]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-32 w-96 h-96 bg-[#E6B800]/25 blur-3xl rounded-full" />
        <div className="absolute top-32 -left-32 w-80 h-80 bg-[#2D5A27]/10 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-[#2D5A27] text-sm font-semibold shadow-md shadow-[#2D5A27]/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D4A017] mr-2 animate-pulse" />
              Pure Nepali Goodness
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1B4332] leading-tight mb-6">
              <span className="block">Pure Nepali.</span>
              <span className="block text-[#D4A017]">From Our Factory</span>
              <span className="block">To Your Kitchen.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#333333] leading-relaxed mb-8 max-w-2xl">
              Authentic mustard oil, daal, grains &amp; natural products crafted with love in Nepal. We work directly with local farmers to deliver freshness, purity, and trust straight to your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/products?featured=true"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#D4A017] text-[#1B4332] font-semibold rounded-full shadow-[0_12px_30px_rgba(212,160,23,0.35)] hover:bg-[#E6B800] hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Products
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#1B4332] text-[#1B4332] font-semibold rounded-full hover:bg-[#1B4332] hover:text-white transition-all duration-300"
              >
                Our Story
              </Link>
            </div>

          <div className="flex flex-wrap gap-4 text-sm text-[#1B4332]/80">
              {heroHighlights.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm shadow-[#1B4332]/10">
                  <Icon className="w-4 h-4 text-[#D4A017]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-[#D4A017] via-[#E6B800] to-[#F8D477] opacity-80 blur-2xl" />
            <div className="relative bg-white rounded-[32px] p-6 md:p-10 shadow-2xl border border-[#F2E2B5]">
              <div className="relative rounded-3xl overflow-hidden h-[420px] bg-[#FAF2D7]">
                <div
                  className="absolute inset-0 bg-[url('/banner.png')] bg-cover bg-center scale-110 transition-transform duration-700 hover:scale-100"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332]/50 via-transparent to-[#D4A017]/20" />

                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-[#1B4332] shadow-lg">
                  <p className="text-xs uppercase tracking-wide text-[#8B4513]">Flagship</p>
                  <p className="text-xl font-semibold">Mustard Oil</p>
                  <p className="text-sm text-[#333333]/70">Factory Fresh · Stone-Pressed</p>
                </div>

                <div className="absolute bottom-6 right-6 bg-[#1B4332] text-white rounded-2xl px-4 py-3 shadow-xl">
                  <p className="text-xs uppercase tracking-wide text-[#E6B800]">Trusted by</p>
                  <p className="text-2xl font-bold">10K+ Families</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: '100% Natural', value: '🌿' },
                  { label: 'Factory Direct', value: '🏭' },
                  { label: 'Made in Nepal', value: '🇳🇵' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#FAF9F6] rounded-2xl p-4 text-center border border-[#F2E2B5]">
                    <div className="text-2xl mb-2">{item.value}</div>
                    <p className="text-xs font-semibold text-[#1B4332]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 text-[#1B4332]/70 text-sm">
          <div className="h-px w-12 bg-[#D4A017]" />
          Scroll to discover more goodness
        </div>
      </div>
    </section>
  )
})

HeroSection.displayName = 'HeroSection'

export default HeroSection
