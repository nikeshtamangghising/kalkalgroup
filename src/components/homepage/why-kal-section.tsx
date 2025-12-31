'use client'

import { memo } from 'react'

const reasons = [
  {
    icon: '🌿',
    title: 'Pure Ingredients',
    description: 'Stone-pressed oils and single-origin grains with zero mixing or chemicals.',
  },
  {
    icon: '😋',
    title: 'Authentic Taste',
    description: 'Traditional Nepali flavors that remind you of home in every spoon.',
  },
  {
    icon: '🤝',
    title: 'Factory Transparency',
    description: 'Full control from sourcing to bottling to guarantee trust in every batch.',
  },
]

const WhyKalSection = memo(() => {
  return (
    <section className="bg-[#F5F5F5] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-white text-[#2D5A27] text-sm font-semibold mb-6 shadow-sm">
          Why Nepali Families Choose Us
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4">
          Purity • Taste • Trust
        </h2>
        <p className="text-lg text-[#555555] max-w-3xl mx-auto mb-12">
          We work with local farmers, follow disciplined quality checks, and share everything transparently—so you know exactly what reaches your kitchen.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="relative p-10 rounded-3xl bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 border border-white/70"
            >
              <div className="text-4xl mb-6">{reason.icon}</div>
              <h3 className="text-2xl font-semibold text-[#1B4332] mb-4">{reason.title}</h3>
              <p className="text-base text-[#5A5A5A] leading-relaxed">{reason.description}</p>
              <div className="absolute inset-0 border border-[#D4A017]/30 rounded-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03] rounded-3xl bg-[radial-gradient(circle_at_top,#D4A017,transparent_60%)]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
})

WhyKalSection.displayName = 'WhyKalSection'

export default WhyKalSection
