'use client'

import Link from 'next/link'
import { memo } from 'react'

const AboutPreview = memo(() => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#FBE7C6] via-transparent to-[#D4F0D1] rounded-[32px] blur-2xl" />
            <div className="relative rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.08)] border border-[#F2E2B5] bg-[#FAF9F6]">
              <div
                className="h-[460px] bg-cover bg-center"
                style={{ backgroundImage: "url('/foodstore.png')" }}
                aria-hidden="true"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <p className="text-sm font-semibold text-[#8B4513] uppercase tracking-wide">Since 2074 BS</p>
                <p className="text-3xl font-bold text-[#1B4332]">Kal Kal Group</p>
              </div>
              <div className="absolute bottom-6 right-8 bg-white rounded-3xl px-6 py-5 shadow-xl border border-[#F5DFA1]">
                <p className="text-4xl font-extrabold text-[#D4A017]">10K+</p>
                <p className="text-sm font-semibold text-[#1B4332]">Families Served</p>
              </div>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center px-5 py-2 rounded-full bg-[#FFF6E1] text-[#8B4513] text-sm font-semibold mb-6">
              More Than Products. A Movement.
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B4332] leading-tight mb-6">
              We are building a healthier, more prosperous Nepal.
            </h2>
            <p className="text-lg text-[#555555] leading-relaxed mb-8">
              From cold-pressed mustard oil to nutrient-rich grains, we work directly with farmers, invest in sustainable factories, and keep our supply chain transparent. Every Kal Kal batch is a promise: honest food that empowers Nepali households and livelihoods.
            </p>

            <ul className="space-y-4 text-[#1B4332] font-semibold mb-10">
              {[
                'Factory to kitchen traceability',
                'Farmer-first sourcing partnerships',
                'Modern hygienic processing with traditional wisdom',
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#D4A017]/15 flex items-center justify-center text-[#D4A017]">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[#1B4332] font-semibold text-lg hover:text-[#D4A017] transition-colors"
            >
              Read Our Story
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

AboutPreview.displayName = 'AboutPreview'

export default AboutPreview
