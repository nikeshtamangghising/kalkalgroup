'use client'

import AddressList from '@/components/addresses/address-list'

export default function AddressBook() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Delivery</p>
            <h4 className="text-2xl font-semibold text-slate-900">Shipping addresses</h4>
          </div>
        </div>
        <AddressList type="SHIPPING" showCreateNew />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Billing</p>
          <h4 className="text-2xl font-semibold text-slate-900">Billing addresses</h4>
        </div>
        <AddressList type="BILLING" showCreateNew />
      </section>
    </div>
  )
}
