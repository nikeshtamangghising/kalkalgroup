'use client'

import Link from 'next/link'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeOpenIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid'
import { memo, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import MainLayout from '@/components/layout/main-layout'

type FormKeys = 'name' | 'email' | 'phone' | 'inquiryType' | 'subject' | 'message'

const contactCards = [
  {
    title: 'Call Us',
    icon: '📞',
    details: ['01-6619673 (Landline)', '9801354245 (Mobile)', '9801354246 (Mobile)'],
    action: { label: 'Call Now', href: 'tel:+977016619673' },
    helper: 'We respond immediately during business hours.',
  },
  {
    title: 'Email Us',
    icon: '📧',
    details: ['Kalkalgroup98@gmail.com', 'Response within 24 hours'],
    action: { label: 'Send Email', href: 'mailto:Kalkalgroup98@gmail.com' },
    helper: 'Perfect for product info, partnerships, and press.',
  },
  {
    title: 'Visit Us',
    icon: '📍',
    details: ['Suryabinayak–5', 'Bhaktapur, Nepal'],
    action: {
      label: 'Get Directions',
      href: 'https://www.google.com/maps/place/Suryabinayak+5,+Bhaktapur',
      target: '_blank',
    },
    helper: 'Schedule a factory tour or pickup.',
  },
]

const inquiryOptions = [
  'General Inquiry',
  'Product Information',
  'Bulk Order / Wholesale',
  'Become a Retailer',
  'Feedback / Suggestion',
  'Complaint',
  'Partnership Opportunity',
  'Other',
]

const businessHours = [
  { day: 'Sunday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Monday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Tuesday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Wednesday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Thursday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Friday', hours: '10:00 AM – 6:00 PM', open: true },
  { day: 'Saturday', hours: 'Closed', open: false },
]

const faqs = [
  {
    question: 'Where can I buy Kal Kal products?',
    answer:
      'Our products are available at major retailers across Nepal and directly from our facility in Bhaktapur. Contact us for specific retailer locations near you.',
  },
  {
    question: 'Do you offer bulk/wholesale orders?',
    answer:
      'Yes! We offer competitive pricing for bulk and wholesale orders. Call 9801354245 or choose “Bulk Order / Wholesale” in the form to get a tailored quote.',
  },
  {
    question: 'How can I become a retailer?',
    answer:
      'Fill out the form selecting “Become a Retailer” as the inquiry type or call us directly. Our team will guide you through onboarding and distribution requirements.',
  },
  {
    question: 'What areas do you deliver to?',
    answer:
      'We currently serve all major cities in Nepal with our logistics partners. Let us know your delivery location and we’ll confirm availability and timelines.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 2–5 business days depending on your location and order size.',
  },
  {
    question: 'Are your products 100% natural?',
    answer:
      'Yes, every Kal Kal product is 100% pure and natural with no chemicals or additives. We follow strict quality checks for every batch.',
  },
]

const contactBarItems = [
  {
    label: 'Call',
    value: '9801354245',
    href: 'tel:+9779801354245',
    icon: <PhoneIcon className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    label: 'Email',
    value: 'Kalkalgroup98@gmail.com',
    href: 'mailto:Kalkalgroup98@gmail.com',
    icon: <EnvelopeOpenIcon className="h-5 w-5 text-white" aria-hidden />,
  },
  {
    label: 'Visit',
    value: 'Suryabinayak–5, Bhaktapur',
    href: 'https://www.google.com/maps/place/Suryabinayak+5,+Bhaktapur',
    icon: <MapPinIcon className="h-5 w-5 text-white" aria-hidden />,
  },
]

const getKathmanduDate = () =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))

const ContactClient = memo(() => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<Record<FormKeys, string>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const kathmanduTime = useMemo(() => getKathmanduDate(), [])

  const currentStatus = useMemo(() => {
    const dayIndex = kathmanduTime.getDay() // 0 (Sun) - 6 (Sat)
    const hour = kathmanduTime.getHours()
    const minute = kathmanduTime.getMinutes()
    const today = businessHours[dayIndex]

    if (!today || !today.open) {
      const nextOpen =
        businessHours.find((slot, idx) => idx > dayIndex && slot.open) ??
        businessHours.find(slot => slot.open)
      return {
        isOpen: false,
        label: 'We’re currently closed',
        subLabel: nextOpen
          ? `Opens ${nextOpen.day} at 10:00 AM NPT`
          : 'Please leave a message and we’ll reply soon.',
      }
    }

    const isOpen = hour > 9 && hour < 18 ? true : hour === 10 ? minute >= 0 : hour === 18 ? minute === 0 : false
    const closesAt = '6:00 PM'
    return {
      isOpen,
      label: isOpen ? '🟢 We’re currently open' : '🔴 We’re currently closed',
      subLabel: isOpen ? `Closes today at ${closesAt}` : 'Leave a message and we’ll reply within 24 hours.',
    }
  }, [kathmanduTime])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name as FormKeys]: undefined }))
  }

  const validateForm = () => {
    const newErrors: Partial<Record<FormKeys, string>> = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your name (min 2 characters)'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (formData.phone && !/^9[78]\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid Nepali phone number'
    }
    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select inquiry type'
    }
    if (formData.subject && formData.subject.length < 3) {
      newErrors.subject = 'Subject should be at least 3 characters'
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter your message (min 10 characters)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) {
      setStatus('error')
      return
    }

    try {
      setStatus('loading')
      await new Promise(resolve => setTimeout(resolve, 1800))
      setStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        subject: '',
        message: '',
      })
      setErrors({})
    } catch {
      setStatus('error')
    }
  }

  const inputBase =
    'w-full h-13 rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 text-[16px] text-[#333] transition focus:border-[#D4A017] focus:outline-none focus:ring-4 focus:ring-[#D4A017]/20'

  const inputError =
    'border-[#E53935] bg-[#FFF5F5] focus:border-[#E53935] focus:ring-[#E53935]/20'

  return (
    <MainLayout>
      <div className="bg-[#FAF9F6]">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-[#FAF9F6] to-[#F3EEE2]">
          <div className="absolute inset-0 opacity-90">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(212,160,23,0.15),_transparent_50%)]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-[#8C6D1F]">Home &gt; Contact</p>
            <div className="mt-8 text-center">
              <h1 className="text-4xl font-bold text-[#1B4332] md:text-5xl">Get In Touch</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#666] md:text-lg">
                We’d love to hear from you. Whether you have a question about our products, pricing, or anything
                else—our team is ready to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {contactCards.map(card => (
              <div
                key={card.title}
                className="group rounded-3xl border border-transparent bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.07)] transition hover:-translate-y-1 hover:border-[#F3D9A4]"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FDF6E3] text-3xl transition group-hover:scale-105">
                  {card.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#333]">{card.title}</h3>
                <div className="mt-4 space-y-2 text-base text-[#666]">
                  {card.details.map(line => (
                    <p key={line}>
                      {line.includes('@') ? (
                        <a className="text-[#D4A017]" href={`mailto:${line}`}>
                          {line}
                        </a>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[#8c8c8c]">{card.helper}</p>
                <a
                  className="mt-6 inline-flex items-center justify-center text-sm font-semibold text-[#D4A017] transition hover:text-[#B8870F]"
                  href={card.action.href}
                  target={card.action.target}
                >
                  {card.action.label}
                  <span className="ml-2 text-lg">→</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Contact Bar */}
        <section className="bg-[#1B4332] py-6">
          <div className="mx-auto flex flex-col flex-wrap gap-6 px-4 sm:px-6 lg:max-w-6xl lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p className="text-lg font-semibold text-white">Need immediate help?</p>
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end">
              {contactBarItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.label === 'Visit' ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">{item.icon}</span>
                  <div>
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="text-base font-semibold">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Map */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8C6D1F]">Send Us a Message</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#333]">Let’s make something great together</h2>
              <p className="mt-4 text-sm leading-6 text-[#666]">
                Fill out the form and our team will get back to you within 24 hours.
                Prefer a call? Reach us at <a className="text-[#D4A017]" href="tel:+9779801354245">9801354245</a>.
              </p>

              <div className="mt-6 rounded-2xl bg-[#FDF6E3] p-4 text-sm text-[#8C6D1F]">
                <p className="font-semibold">{currentStatus.label}</p>
                <p>{currentStatus.subLabel}</p>
              </div>

              {status === 'success' && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#43A047] bg-[#E8F5E9] px-4 py-3 text-[#1B5E20]">
                  <CheckCircleIcon className="h-6 w-6" aria-hidden />
                  <div>
                    <p className="font-semibold">Message sent successfully!</p>
                    <p className="text-sm text-[#1B5E20]/80">Thank you for reaching out. We’ll respond within 24 hours.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#E53935] bg-[#FFEBEE] px-4 py-3 text-[#B71C1C]">
                  <ExclamationCircleIcon className="h-6 w-6" aria-hidden />
                  <div>
                    <p className="font-semibold">Oops! Something went wrong.</p>
                    <p className="text-sm text-[#B71C1C]/80">
                      Please try again or contact us directly at 9801354245.
                    </p>
                  </div>
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#333]" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      className={`${inputBase} ${errors.name ? inputError : ''}`}
                      id="name"
                      name="name"
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      value={formData.name}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-[#E53935]" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#333]" htmlFor="email">
                      Email *
                    </label>
                    <input
                      className={`${inputBase} ${errors.email ? inputError : ''}`}
                      id="email"
                      name="email"
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      type="email"
                      value={formData.email}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-[#E53935]" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#333]" htmlFor="phone">
                      Phone (optional)
                    </label>
                    <input
                      className={`${inputBase} ${errors.phone ? inputError : ''}`}
                      id="phone"
                      name="phone"
                      onChange={handleInputChange}
                      placeholder="98XXXXXXXX"
                      type="tel"
                      value={formData.phone}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-[#E53935]" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#333]" htmlFor="subject">
                      Subject (optional)
                    </label>
                    <input
                      className={`${inputBase} ${errors.subject ? inputError : ''}`}
                      id="subject"
                      name="subject"
                      onChange={handleInputChange}
                      placeholder="Brief summary"
                      value={formData.subject}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-[#E53935]" role="alert">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#333]" htmlFor="inquiryType">
                    Inquiry Type *
                  </label>
                  <select
                    className={`${inputBase} ${errors.inquiryType ? inputError : ''}`}
                    id="inquiryType"
                    name="inquiryType"
                    onChange={handleInputChange}
                    value={formData.inquiryType}
                  >
                    <option value="">Select inquiry type</option>
                    {inquiryOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.inquiryType && (
                    <p className="mt-1 text-sm text-[#E53935]" role="alert">
                      {errors.inquiryType}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#333]" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    className={`${inputBase} ${errors.message ? inputError : ''} h-40 resize-y`}
                    id="message"
                    name="message"
                    onChange={handleInputChange}
                    placeholder="How can we help you?"
                    value={formData.message}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-[#E53935]" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#D4A017] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_35px_rgba(212,160,23,0.35)] transition hover:-translate-y-0.5 hover:bg-[#B8870F] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={status === 'loading'}
                  type="submit"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending...
                    </>
                  ) : status === 'success' ? (
                    'Send Another Message'
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="relative h-full overflow-hidden rounded-3xl">
                <iframe
                  allowFullScreen
                  className="h-[520px] w-full border-0"
                  loading="lazy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=85.344%2C27.657%2C85.380%2C27.685&amp;layer=mapnik&amp;marker=27.671%2C85.362"
                  title="Kal Kal Group location map"
                />
                <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8C6D1F]">Visit Us</p>
                  <p className="mt-2 text-xl font-semibold text-[#1B4332]">Suryabinayak–5, Bhaktapur, Nepal</p>
                  <p className="mt-1 text-sm text-[#666]">Factory &amp; Office · Appointment recommended</p>
                  <a
                    className="mt-4 inline-flex items-center text-sm font-semibold text-[#D4A017]"
                    href="https://www.openstreetmap.org/?mlat=27.671&mlon=85.362#map=15/27.671/85.362"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in OpenStreetMap →
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Business Hours */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
            <h2 className="text-3xl font-semibold text-[#333]">Business Hours</h2>
            <p className="mt-3 text-sm text-[#666]">All times are in Nepal Time (GMT+5:45)</p>
            <div className="mt-8 divide-y divide-[#F0E6D4]">
              {businessHours.map(slot => (
                <div
                  key={slot.day}
                  className="flex items-center justify-between py-3 text-left text-base text-[#333]"
                >
                  <span className="font-medium">{slot.day}</span>
                  <span className={!slot.open ? 'font-medium text-[#E53935]' : ''}>{slot.hours}</span>
                </div>
              ))}
            </div>
            <div
              className={`mt-8 rounded-2xl px-6 py-4 text-sm ${
                currentStatus.isOpen
                  ? 'bg-[#E8F5E9] text-[#1B5E20]'
                  : 'bg-[#FFEBEE] text-[#B71C1C]'
              }`}
            >
              {currentStatus.label} — {currentStatus.subLabel}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#FAF3DC] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#8C6D1F]">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#1B4332]">Frequently Asked Questions</h2>
              <p className="mt-3 text-[#5C5C5C]">Save time by checking the answers below.</p>
            </div>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => {
                const isActive = activeFaq === index
                return (
                  <button
                    key={faq.question}
                    className="w-full rounded-2xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                    onClick={() => setActiveFaq(prev => (prev === index ? null : index))}
                    aria-expanded={isActive}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#333]">{faq.question}</p>
                      <span className="text-2xl text-[#D4A017] transition-transform">
                        {isActive ? '−' : '+'}
                      </span>
                    </div>
                    {isActive && (
                      <p className="mt-4 text-sm leading-6 text-[#666]">{faq.answer}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#1B4332]">
          <div className="absolute inset-0 opacity-40">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2),_transparent_60%)]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">Want to explore our products instead?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Discover our range of pure Nepali mustard oil, daal, grains, and more.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#1B4332] shadow-lg transition hover:-translate-y-0.5"
                href="/products"
              >
                View Our Products
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-white/50 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                href="/contact"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
})

ContactClient.displayName = 'ContactClient'

export default ContactClient