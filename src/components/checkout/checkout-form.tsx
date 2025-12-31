'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PaymentMethod } from '@/lib/payment-gateways'
import { Address } from '@/types'
import PaymentMethodSelector from './payment-method-selector'
import Button from '@/components/ui/button'

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface CheckoutFormProps {
  onSuccess: (paymentMethod: PaymentMethod, transactionId?: string) => void
  onError: (error: string) => void
  orderTotal: number
  guestEmail?: string
  onGuestEmailChange?: (email: string) => void
  onPaymentInitiate?: (method: PaymentMethod) => Promise<{ success: boolean; paymentUrl?: string; error?: string }>
  customerInfo?: CustomerInfo
  onCustomerInfoChange?: (info: CustomerInfo) => void
  selectedAddress?: Address | null
}

const CheckoutForm = memo(({ 
  onSuccess, 
  onError, 
  orderTotal, 
  guestEmail, 
  onGuestEmailChange,
  onPaymentInitiate,
  customerInfo: externalCustomerInfo,
  onCustomerInfoChange,
  selectedAddress
}: CheckoutFormProps) => {
  const { user } = useAuth()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cod')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [internalCustomerInfo, setInternalCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || '',
    email: user?.email || guestEmail || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US' // Default country
  })

  // Use external customer info if provided, otherwise use internal state
  const customerInfo = externalCustomerInfo || internalCustomerInfo
  const setCustomerInfo = onCustomerInfoChange || setInternalCustomerInfo

  // Pre-fill customer info from selected address
  useEffect(() => {
    if (selectedAddress) {
      setInternalCustomerInfo({
        name: selectedAddress.fullName || customerInfo.name,
        email: customerInfo.email, // Email is not part of address in this schema
        phone: selectedAddress.phone || customerInfo.phone,
        address: selectedAddress.line1 || customerInfo.address,
        city: selectedAddress.city || customerInfo.city,
        postalCode: selectedAddress.postalCode || customerInfo.postalCode,
        country: selectedAddress.country || customerInfo.country
      })
    }
  }, [selectedAddress])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedPaymentMethod) {
      setMessage('Please select a payment method')
      onError('Please select a payment method')
      return
    }

    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      setMessage('Please fill in all required fields')
      onError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      if (selectedPaymentMethod === 'cod') {
        // For COD, we don't need payment gateway interaction
        setMessage('Order placed successfully! You will pay on delivery.')
        onSuccess(selectedPaymentMethod, `cod-${Date.now()}`)
      } else if (onPaymentInitiate) {
        // For online payment methods, initiate payment
        const result = await onPaymentInitiate(selectedPaymentMethod)
        
        if (result.success && result.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = result.paymentUrl
        } else {
          throw new Error(result.error || 'Failed to initiate payment')
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [selectedPaymentMethod, customerInfo, onSuccess, onError, onPaymentInitiate])

  // Set COD as default payment method if no method is selected
  // useEffect(() => {
  //   if (!selectedPaymentMethod) {
  //     setSelectedPaymentMethod('cod')
  //   }
  // }, [selectedPaymentMethod])

  // If we have a selected address, we can hide the address input fields
  const shouldShowAddressFields = !selectedAddress

  return (
    <div>
      {/* Debug info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Debug: CheckoutForm is rendering. Selected payment method: {selectedPaymentMethod || 'none'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      {!shouldShowAddressFields ? (
        // Simplified contact info when address is pre-selected
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your full name"
                readOnly={!!selectedAddress?.fullName}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                  onGuestEmailChange?.(e.target.value)
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>
      ) : (
        // Full contact and address info when no address is selected
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                  onGuestEmailChange?.(e.target.value)
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Shipping Address
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              id="address"
              type="text"
              required
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your street address"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              id="city"
              type="text"
              required
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your city"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              id="postalCode"
              type="text"
              required
              value={customerInfo.postalCode}
              onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your postal code"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              id="country"
              type="text"
              required
              value={customerInfo.country}
              onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your country"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Payment Method
        </h4>
        <PaymentMethodSelector 
          selectedMethod={selectedPaymentMethod} 
          onMethodSelect={setSelectedPaymentMethod}
          orderTotal={orderTotal}
        />
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Order Total</p>
          <p>${orderTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className={`p-3 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 mt-4 flex items-center justify-center">
        <div className="flex items-center mr-4">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your information is encrypted and secure
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Multiple secure payment options available
        </div>
      </div>
    </form>
    </div>
  )
})

CheckoutForm.displayName = 'CheckoutForm'

export default CheckoutForm