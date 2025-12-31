'use client'

import { useState, useEffect, useCallback } from 'react'
import { Address } from '@/types'
import Button from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AddressForm, { AddressFormData } from './address-form'
import { PencilSquareIcon, TrashIcon, CheckCircleIcon, MapPinIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type AddressRecord = Address & {
  fullName?: string
  email?: string
  address?: string
}

interface AddressListProps {
  selectedAddressId?: string
  onAddressSelect?: (address: Address) => void
  type?: 'SHIPPING' | 'BILLING'
  showCreateNew?: boolean
  onCreateNew?: () => void
  onAddressesChange?: (addresses: Address[]) => void
}

const formatNameFromParts = (addr: Partial<AddressRecord>) => {
  return addr.fullName || 'Unnamed Address'
}

const formatAddressLine = (addr: Partial<AddressRecord>) => {
  return addr.line1 || ''
}

const formatEmail = (addr: Partial<AddressRecord>) => {
  return addr.email || (addr as any)?.email || ''
}

export default function AddressList({
  selectedAddressId,
  onAddressSelect,
  type = 'SHIPPING',
  showCreateNew = true,
  onCreateNew,
  onAddressesChange
}: AddressListProps) {
  const [addresses, setAddresses] = useState<AddressRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/addresses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      const normalized: AddressRecord[] = (data.addresses || []).map((addr: AddressRecord) => ({
        ...addr,
        fullName: formatNameFromParts(addr),
        address: formatAddressLine(addr),
        email: formatEmail(addr),
      }))
      setAddresses(normalized)
      onAddressesChange?.(normalized)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch addresses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleCreateAddress = async (addressData: AddressFormData) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create address')
      }

      setShowForm(false)
      await fetchAddresses()
      onCreateNew?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create address')
    }
  }

  const handleUpdateAddress = async (addressData: AddressFormData) => {
    if (!editingAddress) return

    try {
      const response = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update address')
      }

      setEditingAddress(null)
      setShowForm(false)
      await fetchAddresses()
      onCreateNew?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete address')
      }

      await fetchAddresses()
      onCreateNew?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set default address')
      }

      await fetchAddresses()
      onCreateNew?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set default address')
    }
  }

  const handleEdit = (address: AddressRecord) => {
    setEditingAddress(address)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setShowForm(false)
  }

  const handleCreateClick = () => {
    setFormMode('create')
    setEditingAddress(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading addresses...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl">
          ⚠️
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">We couldn’t load these addresses yet</p>
          <p className="text-sm text-slate-600">
            If you haven’t saved a {type === 'SHIPPING' ? 'shipping' : 'billing'} address, this area will stay empty until you do.
            Otherwise, tap refresh to try again.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={fetchAddresses}>Refresh addresses</Button>
        </div>
      </div>
    )
  }

  // Filter addresses by type if specified
  const filteredAddresses = type ? addresses.filter(addr => addr.type === type) : addresses

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ${
              type === 'SHIPPING' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {type === 'SHIPPING' ? '📦' : '💳'}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {type === 'SHIPPING' ? 'Delivery' : 'Billing'}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {type === 'SHIPPING' ? 'Shipping Addresses' : 'Billing Addresses'}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({filteredAddresses.length})
              </span>
            </h3>
          </div>
        </div>
        {showCreateNew && (
          <Button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#b8860b] text-white"
          >
            <PlusIcon className="h-5 w-5" />
            Add New
          </Button>
        )}
      </div>

      {filteredAddresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-gray-500 shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <MapPinIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              No {type === 'SHIPPING' ? 'shipping' : 'billing'} addresses yet
            </p>
            <p className="text-sm text-slate-500">
              Add one to speed through checkout and invoices.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => setShowForm(true)}>
              Add {type === 'SHIPPING' ? 'shipping' : 'billing'} address
            </Button>
            <Link href="/addresses">
              <Button variant="outline">Manage addresses</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAddresses.map((address) => (
            <Card
              key={address.id}
              className={`relative cursor-pointer border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                address.isDefault ? 'border-[#D4A017]' : 'border-[#E5E5E5]'
              } ${selectedAddressId === address.id ? 'ring-2 ring-[#D4A017]' : ''} rounded-2xl`}
            >
              {address.isDefault && (
                <span className="absolute left-4 top-4 inline-flex items-center rounded-md bg-[#D4A017] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  ★ Default
                </span>
              )}
              <CardContent className="p-6 space-y-4" onClick={() => onAddressSelect?.(address)}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatNameFromParts(address)}
                    </p>
                    {address.phone && <p className="text-sm text-slate-500">{address.phone}</p>}
                  </div>
                  <span
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {address.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                  </span>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-800">{formatAddressLine(address)}</p>
                  <p>
                    {address.city}, {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  {formatEmail(address) && (
                    <p className="text-slate-900">{formatEmail(address)}</p>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(address)
                    }}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-slate-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetDefault(address.id)
                      }}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAddress(address.id)
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {showCreateNew && (
            <button
              onClick={handleCreateClick}
              className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4A017] bg-white p-6 text-center text-slate-600 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF6E3] text-[#D4A017]">
                <PlusIcon className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Add New Address</p>
              <p className="text-sm text-slate-500">
                Save another {type === 'SHIPPING' ? 'delivery' : 'billing'} location for faster checkout.
              </p>
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <button
              className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100"
              onClick={handleCancelEdit}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <AddressForm
              initialData={
                formMode === 'edit' && editingAddress
                  ? {
                      type: editingAddress.type as 'SHIPPING' | 'BILLING',
                      fullName: formatNameFromParts(editingAddress),
                      email: editingAddress.email || '',
                      phone: editingAddress.phone || '',
                      address: formatAddressLine(editingAddress),
                      city: editingAddress.city || '',
                      postalCode: editingAddress.postalCode || '',
                      country: editingAddress.country || 'Nepal',
                      isDefault: editingAddress.isDefault,
                    }
                  : {
                      type,
                      country: 'Nepal',
                      isDefault: filteredAddresses.length === 0,
                    }
              }
              onSubmit={formMode === 'edit' ? handleUpdateAddress : handleCreateAddress}
              onCancel={handleCancelEdit}
              title={
                formMode === 'edit'
                  ? 'Edit Address'
                  : `Add ${type === 'SHIPPING' ? 'Shipping' : 'Billing'} Address`
              }
              submitLabel={formMode === 'edit' ? 'Update Address' : 'Save Address'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
