'use client'

import { memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import MainLayout from '@/components/layout/main-layout'
import {
  ArrowDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const values = [
  {
    title: 'National Pride',
    description:
      'We are rooted in Nepali soil and obsessed with building a healthier, prouder nation through local entrepreneurship.',
    emoji: '🇳🇵',
  },
  {
    title: 'Collective Cooperation',
    description:
      'We bring people from every background together—farmers, technologists, traders—to craft honest food products.',
    emoji: '🤝',
  },
  {
    title: 'Purity & Transparency',
    description:
      'Every batch is traceable from farmer field to kitchen shelf with zero compromise on ingredients or process.',
    emoji: '🌿',
  },
  {
    title: 'Innovation with Tradition',
    description:
      'We pair stone-pressed wisdom with modern hygiene and automation so taste, nutrition, and trust can coexist.',
    emoji: '💡',
  },
  {
    title: 'Empowerment',
    description:
      'Our supply chain uplifts local growers, workers, and families with fair pay, training, and long-term partnerships.',
    emoji: '🚀',
  },
  {
    title: 'Trust & Care',
    description:
      'We treat every customer like family—listening, improving, and showing up with accountability every day.',
    emoji: '🛡️',
  },
]

const stats = [
  { value: 500, suffix: '+', label: 'Local Farmers Supported' },
  { value: 10000, suffix: '+', label: 'Families Served' },
  { value: 50, suffix: '+', label: 'Retail Partners' },
  { value: 100, suffix: '%', label: 'Pure & Natural' },
]

const timeline = [
  {
    year: '2020',
    title: 'Kal Kal is founded',
    description: 'A collective of dreamers come together to build a Nepali-first food movement.',
  },
  {
    year: '2021',
    title: 'Flagship mustard oil launches',
    description: 'Our first cold-pressed batch reaches 1,000 households in Kathmandu Valley.',
  },
  {
    year: '2022',
    title: 'Factory expansion',
    description: 'We install state-of-the-art hygiene labs and scale to 50,000+ liters per day.',
  },
  {
    year: '2023',
    title: 'Nationwide reach',
    description: 'Distribution partners in 50+ districts carry Kal Kal products to every province.',
  },
  {
    year: 'Future',
    title: 'A healthier Nepal',
    description: 'We are investing in farmer cooperatives, new grains, and factory tours for transparency.',
  },
]

const team = [
  {
    name: 'Rabi Raj Karki',
    role: 'Chairman',
    quote: 'Leadership means standing with our farmers and customers every single day.',
    photo: '/member/Rabi%20Raj%20Karki.jpeg',
  },
  {
    name: 'Samir Narayan Shrestha',
    role: 'Chief Executive Officer',
    quote: 'We are building products that taste like home yet fuel the future of Nepal.',
    photo: '/member/Samir%20Narayan%20Shrestha.jpeg',
  },
]

const differentiators = [
  '100% pure, chemical-free ingredients from Nepali farms.',
  'Factory-direct transparency—know exactly where your food comes from.',
  'Traditional processes enhanced with modern hygiene.',
  'Rigorous lab testing and certifications for every batch.',
  'Community-first: we reinvest in farmer training and sustainable techniques.',
  'Trusted by thousands of Nepali families every single day.',
]

const StatCard = ({ value, suffix, label }: { value: number; suffix?: string; label: string }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const animate = () => {
      const duration = 1800
      const start = performance.now()

      const tick = (current: number) => {
        const progress = Math.min((current - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.floor(eased * value))
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl font-bold text-[#D4A017] mb-2">
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <p className="text-lg text-[#4F4F4F]">{label}</p>
    </div>
  )
}

const AboutClient = memo(() => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FFFFFF]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#FAF9F6]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#FFF3D3] via-transparent to-transparent opacity-70" />
            <div className="absolute -bottom-20 right-0 w-[32rem] h-[32rem] bg-[#D4A017]/15 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#8B6B2C] mb-4">Home / About</p>
            <h1 className="text-4xl md:text-6xl font-bold text-[#1B4332] leading-tight mb-6">
              Building a Healthier, More Prosperous Nepal
            </h1>
            <p className="text-lg md:text-xl text-[#4F4F4F] max-w-3xl mx-auto">
              Kal Kal Group is a movement of farmers, makers, and dreamers turning pure Nepali ingredients
              into products you can trust—from our factory to your kitchen.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 text-[#1B4332]/70">
              <ArrowDownIcon className="w-5 h-5 animate-bounce" />
              <span className="text-sm uppercase tracking-[0.3em]">Scroll</span>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="bg-[#FAF9F6] py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-5 py-2 rounded-full bg-[#FFF3D3] text-[#8B6B2C] text-sm font-semibold mb-4">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Our Story
              </div>
              <h2 className="text-4xl font-bold text-[#1B4332]">From a Small Idea to a National Promise</h2>
            </div>

            <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
              <div className="space-y-10">
                <div className="bg-white rounded-[32px] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-[#F4E5C1]">
                  <p className="text-lg text-[#4F4F4F] leading-relaxed">
                    Kal Kal started as a belief: Nepal deserves pure, honest food backed by economic
                    empowerment. We blend ancestral techniques like stone-pressing with modern hygiene labs
                    so that authenticity and safety can thrive together.
                  </p>
                </div>
                <div className="rounded-[32px] bg-white p-10 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-[#E8E1D0]">
                  <blockquote className="text-2xl md:text-3xl font-medium italic text-[#1B4332]">
                    “We bring people from all backgrounds together to produce and market natural,
                    health-promoting products. It’s how we build a healthier nation.”
                  </blockquote>
                  <p className="mt-4 text-sm font-semibold tracking-[0.3em] text-[#C08518] uppercase">
                    Founder—Kal Kal Group
                  </p>
                </div>
                <p className="text-lg text-[#4F4F4F] leading-relaxed">
                  Every bottle of mustard oil, every grain of daal, and every packet of flour carries a
                  promise: transparent sourcing, community upliftment, and the taste of home. We have grown
                  from a single factory floor to a nation-wide network because people feel that commitment.
                </p>
              </div>

              <div className="grid gap-8">
                <div
                  className="h-72 rounded-[32px] overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.15)]"
                  style={{
                    backgroundImage: "url('/team.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="h-72 rounded-[32px] overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.15)]"
                  style={{
                    backgroundImage: "url('/public.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="relative bg-[#1B4332] text-white py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-20 top-10 w-72 h-72 bg-[#D4A017]/30 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="uppercase tracking-[0.35em] text-[#F8E8B0] text-sm mb-4">What Drives Us</p>
            <h2 className="text-4xl font-bold mb-12">Mission • Vision</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-[28px] p-10 backdrop-blur border border-white/10 hover:-translate-y-1 transition">
                <p className="text-sm uppercase tracking-[0.4em] text-[#F8E8B0] mb-4">Mission</p>
                <p className="text-lg leading-relaxed">
                  To drive economic empowerment and national pride by crafting pure, natural products with
                  collective cooperation across Nepal.
                </p>
              </div>
              <div className="bg-white/10 rounded-[28px] p-10 backdrop-blur border border-white/10 hover:-translate-y-1 transition">
                <p className="text-sm uppercase tracking-[0.4em] text-[#F8E8B0] mb-4">Vision</p>
                <p className="text-lg leading-relaxed">
                  To be the most trusted name in Nepali kitchens—synonymous with purity, transparency, and
                  prosperity for every household.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1B4332]">Our Core Values</h2>
              <p className="text-lg text-[#4F4F4F] mt-4">
                The principles that guide every hiring decision, sourcing partnership, and bottle we deliver.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((valueItem) => (
                <div
                  key={valueItem.title}
                  className="rounded-[28px] border border-[#EEE8D7] p-8 shadow-[0_12px_35px_rgba(15,36,23,0.08)] bg-white hover:-translate-y-1 transition"
                >
                  <div className="text-4xl mb-6">{valueItem.emoji}</div>
                  <h3 className="text-2xl font-semibold text-[#1B4332] mb-3">{valueItem.title}</h3>
                  <p className="text-[#4F4F4F] leading-relaxed">{valueItem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="bg-[#FAF9F6] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-[#1B4332] mb-4">Impact in Numbers</h2>
            <p className="text-lg text-[#4F4F4F] mb-12">
              A data snapshot of what the Kal Kal movement means on the ground.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1B4332]">Our Journey</h2>
              <p className="text-lg text-[#4F4F4F] mt-4">
                A timeline of grit, experimentation, and community breakthroughs.
              </p>
            </div>
            <div className="relative border-l-2 border-[#D4A017] pl-10 space-y-12">
              {timeline.map((milestone, index) => (
                <div key={milestone.year} className="relative">
                  <div className="absolute -left-[39px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-[#D4A017] shadow" />
                  <p className="text-sm uppercase tracking-[0.3em] text-[#C08518] mb-2">
                    {milestone.year}
                  </p>
                  <h3 className="text-2xl font-semibold text-[#1B4332]">{milestone.title}</h3>
                  <p className="text-[#4F4F4F] mt-2">{milestone.description}</p>
                  {index !== timeline.length - 1 && (
                    <div className="absolute -left-0.5 top-8 h-full border-l border-dashed border-[#D4A017]/60" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-[#FAF9F6] py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1B4332]">Meet Our Leadership</h2>
              <p className="text-lg text-[#4F4F4F] mt-4">
                The human beings keeping purity, transparency, and national pride alive.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-[28px] bg-white/90 backdrop-blur border border-[#EEE8D7] shadow-[0_20px_45px_rgba(0,0,0,0.08)] p-8"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] text-2xl overflow-hidden flex-shrink-0">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UsersIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-[#1B4332]">{member.name}</h3>
                      <p className="text-sm uppercase tracking-[0.3em] text-[#8B6B2C]">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-lg text-[#4F4F4F] italic">“{member.quote.replace(/“|”/g, '')}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-white py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1B4332]">Why Choose Kal Kal?</h2>
              <p className="text-lg text-[#4F4F4F] mt-4">
                Beyond products—we offer proof of work, honesty, and relentless quality.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((diff) => (
                <div key={diff} className="flex items-start gap-4 rounded-2xl border border-[#EEE8D7] p-6">
                  <div className="w-10 h-10 rounded-full bg-[#1B4332] flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-[#1B4332]">{diff}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-gradient-to-br from-[#1B4332] via-[#162C22] to-[#0b1b13] text-white py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A017]/25 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="uppercase tracking-[0.4em] text-sm text-[#F8E8B0] mb-5">Taste the Story</p>
            <h2 className="text-4xl font-bold mb-6">Ready to experience pure Nepali goodness?</h2>
            <p className="text-lg text-white/80 mb-10">
              Visit our product shelves or reach out to book a factory tour. We cannot wait to host you and show
              you how trust is brewed daily at Kal Kal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-[#1B4332] font-semibold hover:-translate-y-0.5 transition shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              >
                Explore Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full border border-white/60 text-white font-semibold hover:bg-white/10 transition"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
})

AboutClient.displayName = 'AboutClient'

export default AboutClient