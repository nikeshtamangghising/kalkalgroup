'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import ProfileForm from '@/components/account/profile-form'
import AddressBook from '@/components/account/address-book'
import OrderHistory from '@/components/account/order-history'
import { useAuth } from '@/hooks/use-auth'
import Loading from '@/components/ui/loading'
import Button from '@/components/ui/button'

type SummaryStats = {
  totalOrders: number
  activeOrders: number
  addressCount: number
}

const QUICK_ACTIONS = [
  {
    label: 'Update Password',
    description: 'Keep your account secure',
    targetId: 'security-section',
    icon: '🔒'
  },
  {
    label: 'Add new address',
    description: 'Speed through checkout',
    targetId: 'addresses-section',
    icon: '📍'
  },
  {
    label: 'Track latest order',
    description: 'Check current status',
    targetId: 'orders-section',
    icon: '📦'
  },
  {
    label: 'Edit profile',
    description: 'Refresh your personal info',
    targetId: 'profile-section',
    icon: '✏️'
  },
  {
    label: 'Need help?',
    description: 'Reach our support team',
    href: '/contact',
    icon: '❓'
  },
]

const SIDEBAR_LINKS = [
  { id: 'profile-section', label: 'Profile', description: 'Personal information', icon: '👤' },
  { id: 'addresses-section', label: 'Address Book', description: 'Shipping & billing', icon: '📍' },
  { id: 'orders-section', label: 'Orders', description: 'History & tracking', icon: '📦' },
  { id: 'security-section', label: 'Security', description: 'Password & safety', icon: '🔒' },
]

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [summary, setSummary] = useState<SummaryStats>({
    totalOrders: 0,
    activeOrders: 0,
    addressCount: 0
  })
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('profile-section')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/account')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const loadSummary = async () => {
      if (!isAuthenticated) return
      try {
        setSummaryLoading(true)
        setSummaryError(null)

        const [ordersRes, addressesRes] = await Promise.all([
          fetch('/api/orders?page=1&limit=10'),
          fetch('/api/addresses'),
        ])

        if (!ordersRes.ok) {
          throw new Error('Unable to load orders')
        }
        const ordersJson = await ordersRes.json()
        const totalOrders =
          ordersJson.pagination?.total ??
          ordersJson.data?.length ??
          0
        const activeOrders =
          (ordersJson.data || []).filter((order: any) =>
            ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
          ).length

        if (!addressesRes.ok) {
          throw new Error('Unable to load addresses')
        }
        const addressesJson = await addressesRes.json()
        const addressCount = addressesJson.addresses?.length ?? 0

        setSummary({
          totalOrders,
          activeOrders,
          addressCount,
        })
      } catch (error) {
        console.error(error)
        setSummaryError(
          error instanceof Error ? error.message : 'Failed to load account summary'
        )
      } finally {
        setSummaryLoading(false)
      }
    }

    if (!isLoading && isAuthenticated) {
      loadSummary()
    }
  }, [isAuthenticated, isLoading])

  const [clientLastLogin, setClientLastLogin] = useState('—')

  useEffect(() => {
    setClientLastLogin(new Date().toLocaleString())
  }, [])

  const membershipTier = useMemo(() => {
    const { totalOrders } = summary
    if (totalOrders >= 15) return 'Gold'
    if (totalOrders >= 5) return 'Silver'
    return 'Bronze'
  }, [summary])

  const badgeColor = membershipTier === 'Gold'
    ? 'bg-[#FFF8E1] text-[#B9770E]'
    : membershipTier === 'Silver'
    ? 'bg-slate-100 text-slate-600'
    : 'bg-[#EFEBE9] text-[#6D4C41]'

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-16">
            <Loading size="lg" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const handleNavClick = (id: string) => {
    setActiveNav(id)
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <MainLayout>
      <div className="bg-[#FAF9F6] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <header className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
            <div className="text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <Link href="/" className="text-[#D4A017] hover:underline">Home</Link>
              <span>›</span>
              <span>My Account</span>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-3xl bg-[#1B4332] text-white text-4xl font-bold flex items-center justify-center shadow-xl">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow">
                    Active
                  </button>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-[#1B4332]" id="page-title">
                    {`Welcome back, ${user.name || 'there'}`}
                  </h1>
                  <p className="text-slate-600">
                    Manage your profile, addresses, orders, and security in one place.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      ✓ Verified email
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                      🏆 {membershipTier} member
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-w-[260px]">
                {[
                  { label: 'Orders placed', value: summaryLoading ? '—' : summary.totalOrders },
                  { label: 'Active orders', value: summaryLoading ? '—' : summary.activeOrders },
                  { label: 'Addresses saved', value: summaryLoading ? '—' : summary.addressCount },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm"
                  >
                    <p className="text-2xl font-semibold text-[#1B4332]">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {summaryError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {summaryError}
              </div>
            )}
          </header>

          <section aria-labelledby="quick-actions" className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quick actions</p>
              <h2 id="quick-actions" className="text-2xl font-semibold text-[#1B4332]">Get things done faster</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.href) {
                      router.push(action.href)
                      return
                    }
                    if (action.targetId) {
                      handleNavClick(action.targetId)
                    }
                  }}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4A017] hover:shadow-lg"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1B4332]">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                  <span className="ml-auto text-slate-300">↗</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6 lg:sticky lg:top-8 self-start">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">
                  Account menu
                </h3>
                <nav aria-labelledby="account-nav">
                  <ul className="space-y-1">
                    {SIDEBAR_LINKS.map((link) => (
                      <li key={link.id}>
                        <button
                          onClick={() => handleNavClick(link.id)}
                          className={`w-full text-left rounded-2xl px-4 py-3 transition ${
                            activeNav === link.id
                              ? 'bg-[#FFF8E1] border border-[#D4A017] text-[#1B4332] shadow-sm'
                              : 'bg-transparent border border-transparent text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-semibold flex items-center gap-2">
                            <span>{link.icon}</span>
                            {link.label}
                          </span>
                          <span className="text-xs text-slate-400">{link.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <Card className="bg-[#1B4332] text-white rounded-3xl border-0 shadow-lg">
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">Need help?</p>
                  <h3 className="text-2xl font-semibold">We’re here 24/7</h3>
                  <p className="text-sm text-white/80">
                    Call 9801354245 or send us a message and we'll assist you right away.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href="/contact">
                      <Button variant="outline" className="w-full text-[#1B4332] bg-white">
                        Contact support
                      </Button>
                    </Link>
                    <Link href="/faq">
                      <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                        Browse FAQs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <main className="space-y-10" role="main" aria-labelledby="page-title">
              <section id="profile-section" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile</p>
                    <h2 className="text-2xl font-semibold text-[#1B4332]">Profile information</h2>
                    <p className="text-sm text-slate-500">Update your personal details and contact information</p>
                  </div>
                </div>
                <ProfileForm user={{ ...user, createdAt: (user as any)?.createdAt || new Date().toISOString() }} />
              </section>

              <section id="addresses-section" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Address book</p>
                  <h2 className="text-2xl font-semibold text-[#1B4332]">Shipping & billing addresses</h2>
                  <p className="text-sm text-slate-500">Manage where your orders are delivered and billed</p>
                </div>
                <AddressBook />
              </section>

              <section id="orders-section" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
                  <h2 className="text-2xl font-semibold text-[#1B4332]">Order history & tracking</h2>
                  <p className="text-sm text-slate-500">Review past purchases and track current deliveries</p>
                </div>
                <OrderHistory />
              </section>

              <section id="security-section" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Security</p>
                    <h2 className="text-2xl font-semibold text-[#1B4332]">Keep your account secure</h2>
                    <p className="text-sm text-slate-500">Best practices for protecting your personal information</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">Change password</Button>
                    <Button>Enable 2FA (coming soon)</Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Password</h3>
                    <p className="text-sm text-slate-600 mb-3">Last changed recently. Update regularly for best security.</p>
                    <Button variant="outline" size="sm">Update password</Button>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Two-factor authentication</h3>
                    <p className="text-sm text-slate-600 mb-3">Add an extra layer of protection to your account.</p>
                    <Button variant="outline" size="sm" disabled>Enable soon</Button>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Account information</p>
                  <h2 className="text-2xl font-semibold text-[#1B4332]">Your account at a glance</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Account created', value: new Date((user as any)?.createdAt || Date.now()).toLocaleDateString(), icon: '📅' },
                    { label: 'User ID', value: user.id, icon: '🆔' },
                    { label: 'Last login', value: clientLastLogin, icon: '🕒' },
                    { label: 'Account status', value: 'Active', icon: '🟢' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-4">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
