'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/main-layout'
import AddressList from '@/components/addresses/address-list'
import { Address } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function AddressesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [hasLoadedAddresses, setHasLoadedAddresses] = useState(false)

  if (!isLoading && !isAuthenticated) {
    router.push('/auth/signin?redirect=/addresses')
  }

  const handleAddressesChange = (list: Address[]) => {
    setAddresses(list)
    setHasLoadedAddresses(true)
  }

  const { shippingCount, billingCount, defaultShipping, defaultBilling } = useMemo(() => {
    const shipping = addresses.filter((addr) => addr.type === 'SHIPPING')
    const billing = addresses.filter((addr) => addr.type === 'BILLING')
    const defaultShip = shipping.find((addr) => addr.isDefault)
    const defaultBill = billing.find((addr) => addr.isDefault)

    return {
      shippingCount: shipping.length,
      billingCount: billing.length,
      defaultShipping: defaultShip,
      defaultBilling: defaultBill,
    }
  }, [addresses])

  const getFullName = (addr?: Address) =>
    addr ? addr.fullName : ''

  const formatDate = (value?: Date | string | null) => {
    if (!value) return '—'
    const date = value instanceof Date ? value : new Date(String(value))
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('/textures/noise.png')] opacity-20 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Address book</p>
                <h1 className="text-4xl font-bold tracking-tight">Keep deliveries flowing smoothly</h1>
                <p className="text-slate-200">
                  Save shipping and billing locations so checkout stays effortless. Tap any card below to edit,
                  set defaults, or archive old addresses.
                </p>
                {defaultShipping ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/20 text-orange-200 font-semibold">
                      🚚
                    </div>
                    <div>
                      <p className="font-semibold">Default shipping</p>
                      <p className="text-slate-200">
                        {getFullName(defaultShipping)} · {defaultShipping.city}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                    <p className="font-semibold">No default shipping address yet</p>
                    <p className="text-slate-200">Set one to speed up every checkout.</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                {[
                  { label: 'Shipping', value: shippingCount, accent: true },
                  { label: 'Billing', value: billingCount },
                  { label: 'Defaults', value: [defaultShipping, defaultBilling].filter(Boolean).length },
                  {
                    label: 'Last updated',
                    value: formatDate(addresses[0]?.updatedAt ?? null),
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className={`rounded-2xl border border-white/10 px-4 py-3 text-center ${
                      metric.accent ? 'bg-white/10 backdrop-blur' : 'bg-white/5'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-200">{metric.label}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <div id="shipping">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-500">Fulfillment</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Shipping addresses</h2>
                </div>
              </div>
              <AddressList
                type="SHIPPING"
                showCreateNew={true}
                onAddressesChange={handleAddressesChange}
              />
            </div>

            <div id="billing">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Receipts</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Billing addresses</h2>
                </div>
              </div>
              <AddressList
                type="BILLING"
                showCreateNew={true}
              />
            </div>
          </div>

          {hasLoadedAddresses && addresses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                📍
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">You haven’t added an address yet</h3>
              <p className="text-slate-500">
                Create your first shipping or billing location so orders arrive exactly where you need them.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
