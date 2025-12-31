'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { CalendarIcon } from '@heroicons/react/24/solid'
import MainLayout from '@/components/layout/main-layout'
import ProtectedRoute from '@/components/auth/protected-route'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Loading from '@/components/ui/loading'
import { OrderWithItems, PaginatedResponse } from '@/types'
import { formatPrice } from '@/lib/cart-utils'
import DownloadInvoiceButton from '@/components/orders/download-invoice-button'

const STATUS_CONFIG = {
  ALL: {
    label: 'All Orders',
    badge: 'bg-gray-100 text-gray-700 border border-gray-200',
    icon: <ArrowPathIcon className="h-4 w-4" />,
  },
  PENDING: {
    label: 'Pending',
    badge: 'bg-[#FFF3E0] text-[#E65100]',
    icon: <ClockIcon className="h-4 w-4 text-[#E65100]" />,
  },
  PROCESSING: {
    label: 'Processing',
    badge: 'bg-[#E3F2FD] text-[#1565C0]',
    icon: <ArrowPathIcon className="h-4 w-4 text-[#1565C0]" />,
  },
  SHIPPED: {
    label: 'Shipped',
    badge: 'bg-[#F3E5F5] text-[#7B1FA2]',
    icon: <TruckIcon className="h-4 w-4 text-[#7B1FA2]" />,
  },
  DELIVERED: {
    label: 'Delivered',
    badge: 'bg-[#E8F5E9] text-[#2E7D32]',
    icon: <CheckCircleIcon className="h-4 w-4 text-[#2E7D32]" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-[#FFEBEE] text-[#C62828]',
    icon: <XCircleIcon className="h-4 w-4 text-[#C62828]" />,
  },
  REFUNDED: {
    label: 'Refunded',
    badge: 'bg-[#F5F5F5] text-[#616161]',
    icon: <ArrowPathIcon className="h-4 w-4 text-[#616161]" />,
  },
} as const

const DATE_FILTERS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'All time', value: 0 },
]

const TIMELINE_STEPS: Array<OrderWithItems['status']> = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaginatedResponse<OrderWithItems> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeStatus, setActiveStatus] = useState<keyof typeof STATUS_CONFIG>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[1])

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/orders?page=${currentPage}&limit=10`)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []

    return orders.data.filter((order) => {
      const matchesStatus =
        activeStatus === 'ALL' ? true : order.status === activeStatus

      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const withinDateRange =
        dateFilter.value === 0
          ? true
          : new Date(order.createdAt) >=
            new Date(Date.now() - dateFilter.value * 24 * 60 * 60 * 1000)

      return matchesStatus && matchesSearch && withinDateRange
    })
  }, [orders, activeStatus, searchQuery, dateFilter])

  const stats = useMemo(() => {
    if (!orders) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        deliveredThisMonth: 0,
      }
    }

    const total = orders.pagination.total
    const active = orders.data.filter((order) =>
      ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
    ).length
    const pending = orders.data.filter((order) => order.status === 'PENDING').length
    const deliveredThisMonth = orders.data.filter((order) => {
      const created = new Date(order.createdAt)
      const now = new Date()
      return (
        order.status === 'DELIVERED' &&
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      )
    }).length

    return { total, active, pending, deliveredThisMonth }
  }, [orders])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderTimeline = (status: OrderWithItems['status']) => {
    const currentIndex = TIMELINE_STEPS.findIndex((step) => step === status)

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span>Ordered</span>
          <span>Delivered</span>
        </div>
        <div className="flex items-center">
          {TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex || status === 'DELIVERED'
            const isLast = index === TIMELINE_STEPS.length - 1
            return (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    isCompleted
                      ? 'border-[#2E7D32] bg-[#E8F5E9]'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isCompleted ? 'bg-[#2E7D32]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: OrderWithItems['status']) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    if (!config) return null

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
      >
        {config.icon}
        {config.label}
      </span>
    )
  }

  const renderOrders = () => {
    if (!orders) return null

    if (filteredOrders.length === 0) {
      return (
        <Card className="bg-white/80 backdrop-blur">
          <CardContent className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#FFF8E1] flex items-center justify-center mb-6 text-3xl">
              🔍
            </div>
            <h3 className="text-2xl font-semibold text-[#1B4332]">
              No Orders Match Your Filters
            </h3>
            <p className="text-gray-600 mt-3 mb-6 max-w-md">
              Try adjusting your search or filter criteria to see more orders.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveStatus('ALL')
                  setSearchQuery('')
                  setDateFilter(DATE_FILTERS[1])
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setActiveStatus('ALL')} variant="primary">
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {filteredOrders.map((order, index) => (
          <Card
            key={order.id}
            className={`border-l-4 ${
              STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.badge.includes('#E65100')
                ? 'border-[#FF9800]'
                : STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.badge.includes('#1565C0')
                ? 'border-[#2196F3]'
                : STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.badge.includes('#7B1FA2')
                ? 'border-[#9C27B0]'
                : STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.badge.includes('#2E7D32')
                ? 'border-[#43A047]'
                : STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.badge.includes('#C62828')
                ? 'border-[#E53935]'
                : 'border-[#D4A017]'
            } shadow-sm hover:shadow-xl transition-all duration-300`}
            style={{
              animation: `fadeIn 0.4s ease ${index * 0.05}s`,
            }}
          >
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-[#8C7D6B] flex items-center gap-2">
                    <Link href="/" className="text-[#D4A017] hover:underline">
                      Home
                    </Link>
                    <ChevronRightIcon className="h-4 w-4" />
                    <span>My Orders</span>
                    <ChevronRightIcon className="h-4 w-4" />
                    <span>#{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <h3
                    className="text-xl font-semibold text-[#1B4332] mt-2"
                    id={`order-${order.id}`}
                  >
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {formatDate(order.createdAt.toString())}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  {getStatusBadge(order.status)}
                  <p className="text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-2xl font-bold text-[#1B4332]">
                    {formatPrice(
                      typeof order.grandTotal === 'string' ? parseFloat(order.grandTotal) : order.grandTotal
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600">
                      {item.quantity}x
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-[#1B4332]">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(
                          typeof item.price === 'string' ? parseFloat(item.price) : item.price
                        )}{' '}
                        each
                      </p>
                    </div>
                    <div className="text-base font-semibold text-[#1B4332]">
                      {formatPrice(
                        (typeof item.price === 'string' ? parseFloat(item.price) : item.price) *
                          item.quantity
                      )}
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <button className="text-sm text-[#D4A017] font-medium hover:underline self-start">
                    +{order.items.length - 3} more items
                  </button>
                )}
              </div>

              {renderTimeline(order.status)}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-[#FAF9F6] rounded-xl p-4">
                  <p className="text-sm text-gray-500">Delivery</p>
                  <p className="text-base font-semibold text-[#1B4332] mt-1">
                    Estimated:{' '}
                    {formatDate(order.updatedAt?.toString() ?? order.createdAt.toString())}
                  </p>
                </div>
                <div className="bg-[#FAF9F6] rounded-xl p-4">
                  <p className="text-sm text-gray-500">Shipping</p>
                  <p className="text-base font-semibold text-[#1B4332] mt-1">
                    Kathmandu • Nepal
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-between items-center border-t border-dashed border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Need help?{' '}
                  <Link href="/contact" className="font-semibold text-[#D4A017] hover:underline">
                    Contact support
                  </Link>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                  <DownloadInvoiceButton orderId={order.id} size="sm" />
                  {order.status === 'DELIVERED' && (
                    <Button size="sm" variant="primary">
                      Reorder Items
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <MainLayout>
      <ProtectedRoute>
        <div className="bg-[#FAF9F6] min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <header className="bg-white rounded-3xl shadow-sm px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-[#FFF8E1] opacity-60" />
              <div className="relative">
                <p className="text-sm text-gray-500 mb-3">
                  Home <span className="text-gray-400 mx-2">›</span> My Account{' '}
                  <span className="text-gray-400 mx-2">›</span>
                  <span className="text-[#D4A017] font-medium">Orders</span>
                </p>
                <h1 className="text-4xl font-bold text-[#1B4332] font-['Poppins',_sans-serif]">
                  My Orders
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                  Track, manage, and review all your orders with real-time updates, delivery
                  estimates, and action shortcuts.
                </p>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loading size="lg" />
              </div>
            ) : error ? (
              <Card className="bg-white/90 border border-amber-100 shadow-sm">
                <CardContent className="p-10 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-2xl">
                    ⚠️
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-[#1B4332]">We couldn’t load your orders yet</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      If you haven’t placed any orders, this space will stay empty until your first purchase is completed.
                      Otherwise, please refresh to try again.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={fetchOrders}>Refresh Orders</Button>
                    <Link href="/products">
                      <Button variant="outline">Start Shopping</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : orders && orders.data.length > 0 ? (
              <div className="space-y-10">
                <section className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setActiveStatus(key as keyof typeof STATUS_CONFIG)}
                          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                            activeStatus === key
                              ? 'bg-[#D4A017] text-white shadow-md'
                              : 'bg-[#F5F5F5] text-gray-700 hover:bg-[#EDE7DC]'
                          }`}
                        >
                          {config.icon}
                          {config.label}
                          {key !== 'ALL' && (
                            <span className="text-xs font-semibold text-gray-500">
                              {
                                orders.data.filter((order) => order.status === key).length
                              }
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[240px] relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="search"
                          placeholder="Search by Order ID or product"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-[#F7F7F7] py-3 pl-12 pr-4 text-sm focus:border-[#D4A017] focus:outline-none"
                        />
                      </div>
                      <div className="min-w-[180px] relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={dateFilter.value}
                          onChange={(e) => {
                            const selected = DATE_FILTERS.find(
                              (filter) => filter.value === Number(e.target.value)
                            )
                            if (selected) setDateFilter(selected)
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-10 text-sm appearance-none focus:border-[#D4A017] focus:outline-none"
                        >
                          {DATE_FILTERS.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                              {filter.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 md:grid-cols-4">
                  {[
                    { label: 'Total Orders', value: stats.total },
                    { label: 'Active Orders', value: stats.active },
                    { label: 'Pending', value: stats.pending },
                    { label: 'Delivered this month', value: stats.deliveredThisMonth },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className="bg-white rounded-2xl p-6 text-center border-l-4 border-[#D4A017] shadow-sm"
                      style={{ animation: `fadeInUp 0.4s ease ${index * 0.05}s` }}
                    >
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#1B4332] mt-2">{stat.value}</p>
                    </div>
                  ))}
                </section>

                <section aria-label="Orders list" className="space-y-6">
                  {renderOrders()}
                </section>

                {orders.pagination.totalPages > 1 && (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-500">
                      Showing page {currentPage} of {orders.pagination.totalPages}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: orders.pagination.totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === orders.pagination.totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                <section className="bg-white rounded-3xl p-8 shadow-sm">
                  <h3 className="text-2xl font-semibold text-[#1B4332] mb-6">
                    Need Help With Your Order?
                  </h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      { label: 'Call Us', value: '9801354245', icon: '📞' },
                      { label: 'Email Us', value: 'kalkalgroup98@gmail.com', icon: '📧' },
                      { label: 'WhatsApp', value: '9801354245', icon: '💬' },
                    ].map((contact) => (
                      <div
                        key={contact.label}
                        className="bg-[#FAF9F6] rounded-2xl p-6 text-center shadow-inner"
                      >
                        <div className="text-4xl mb-3">{contact.icon}</div>
                        <p className="text-lg font-semibold text-[#1B4332]">{contact.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{contact.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <Button variant="outline">View FAQ</Button>
                    <Button variant="outline">Return Policy</Button>
                  </div>
                </section>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#FFF8E1] rounded-2xl flex items-center justify-center text-4xl">
                    📦
                  </div>
                  <h2 className="text-3xl font-semibold text-[#1B4332] mb-3">No Orders Yet</h2>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    You haven&apos;t placed any orders yet. Start shopping to see your purchases
                    here!
                  </p>
                  <Link href="/products">
                    <Button size="lg" variant="primary">
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </MainLayout>
  )
}