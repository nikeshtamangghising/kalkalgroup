'use client'

import { memo } from 'react'

const trustSignals = [
  {
    icon: '🌿',
    title: '100% Natural',
    description: 'Cold-pressed goodness without any mixing or chemicals.'
  },
  {
    icon: '🏭',
    title: 'Factory Direct',
    description: 'We control every step from sourcing to bottling for purity.'
  },
  {
    icon: '🇳🇵',
    title: 'Made in Nepal',
    description: 'Proudly crafted with local farmers and Nepali expertise.'
  },
  {
    icon: '👨‍🌾',
    title: 'Local Farmers',
    description: 'Empowering farmer partners with fair pricing & support.'
  }
]

const TrustBar = memo(() => {
  return (
    <section className="relative bg-[#2D5A27] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/5 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal) => (
            <div
              key={signal.title}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-3xl" aria-hidden="true">
                {signal.icon}
              </div>
              <div>
                <p className="text-base font-semibold tracking-wide uppercase text-[#F8E8B0]">
                  {signal.title}
                </p>
                <p className="text-sm text-white/80">{signal.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

TrustBar.displayName = 'TrustBar'

export default TrustBar
