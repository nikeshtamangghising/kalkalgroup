import { cache } from '../cache/redis-client'
import { logger } from '../monitoring/logger'
import { productService } from './product-service'
import { orderService } from './order-service'
import { cartService } from './cart-service'
import { getPaymentGatewayManager } from '@/lib/payment-gateways'
import { getCartSummaryWithSettings } from '@/lib/cart-utils-server'
import { EmailService } from '@/lib/email-service'

export interface CheckoutItem {
  productId: string
  quantity: number
}

export interface ShippingAddress {
  fullName: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode: string
}

export interface CheckoutData {
  method: 'esewa' | 'khalti' | 'cod'
  items: CheckoutItem[]
  guestEmail?: string
  shippingAddress?: ShippingAddress
  userId?: string
}

export interface PaymentSession {
  orderId: string
  userId?: string
  guestEmail?: string
  cartItems: Array<{
    productId: string
    quantity: number
    price: number
  }>
  amount: number
  shippingAddress?: ShippingAddress
  method: string
  expiresAt: Date
}

export class CheckoutService {
  private sessionPrefix = 'checkout:session:'
  private sessionTTL = 1800 // 30 minutes

  async initiateCheckout(data: CheckoutData) {
    try {
      logger.info('Initiating checkout', {
        method: data.method,
        itemCount: data.items.length,
        userId: data.userId,
        isGuest: !data.userId
      })

      // Validate and fetch product data
      const cartItems = await this.validateAndFetchProducts(data.items)

      // Calculate order total
      const summary = await getCartSummaryWithSettings(cartItems)

      // Generate unique order ID
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Prepare product name for payment
      const productName = cartItems.length === 1 
        ? cartItems[0].product.name
        : `Order with ${cartItems.length} items`

      // Get payment gateway manager
      const paymentManager = getPaymentGatewayManager()

      // Prepare payment configuration
      const paymentConfig = {
        method: data.method,
        orderId,
        amount: summary.total,
        productName,
        customerInfo: {
          email: data.guestEmail || undefined,
          name: undefined, // Will be filled by auth middleware if user is logged in
        },
      }

      // Handle COD payments immediately
      if (data.method === 'cod') {
        return await this.processCODPayment(orderId, cartItems, summary, data)
      }

      // Initiate online payment
      const paymentResult = await paymentManager.initiatePayment(paymentConfig)

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment initiation failed')
      }

      // Store session data for later order creation
      await this.storePaymentSession(orderId, {
        orderId,
        userId: data.userId,
        guestEmail: data.guestEmail,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: (item.product as any).discountPrice || (item.product as any).price || Number(item.product.basePrice),
        })),
        amount: summary.total,
        shippingAddress: data.shippingAddress,
        method: data.method,
        expiresAt: new Date(Date.now() + this.sessionTTL * 1000)
      })

      logger.info('Checkout initiated successfully', {
        orderId,
        method: data.method,
        amount: summary.total,
        transactionId: paymentResult.transactionId
      })

      return {
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId,
        orderId,
        method: data.method,
        amount: summary.total,
        orderCreated: false
      }

    } catch (error) {
      logger.error('Failed to initiate checkout', { error, data })
      throw error
    }
  }

  async verifyPayment(transactionId: string, orderId: string) {
    try {
      logger.info('Verifying payment', { transactionId, orderId })

      // Get payment session data
      const sessionData = await this.getPaymentSession(orderId)
      if (!sessionData) {
        throw new Error('Payment session not found or expired')
      }

      // Verify payment with gateway
      const paymentManager = getPaymentGatewayManager()
      const verificationResult = await paymentManager.verifyPayment(
        sessionData.method as 'esewa' | 'khalti' | 'cod',
        transactionId
      )

      if (!verificationResult.success) {
        throw new Error(verificationResult.error || 'Payment verification failed')
      }

      // Create order after successful payment
      const order = await this.createOrderFromSession(sessionData, transactionId)

      // Clear payment session
      await this.clearPaymentSession(orderId)

      // Clear user's cart if they were logged in
      if (sessionData.userId) {
        await cartService.clearCart({ userId: sessionData.userId })
      }

      // Send confirmation email
      await this.sendOrderConfirmation(order, sessionData)

      logger.info('Payment verified and order created', {
        orderId: order.id,
        transactionId,
        amount: sessionData.amount
      })

      return {
        success: true,
        order,
        transactionId
      }

    } catch (error) {
      logger.error('Failed to verify payment', { error, transactionId, orderId })
      throw error
    }
  }

  async getPaymentSession(orderId: string): Promise<PaymentSession | null> {
    try {
      const cacheKey = `${this.sessionPrefix}${orderId}`
      const sessionData = await cache.get<PaymentSession>(cacheKey)
      
      if (sessionData && new Date() > new Date(sessionData.expiresAt)) {
        // Session expired, remove it
        await cache.del(cacheKey)
        return null
      }
      
      return sessionData
    } catch (error) {
      logger.error('Failed to get payment session', { error, orderId })
      return null
    }
  }

  private async validateAndFetchProducts(items: CheckoutItem[]) {
    const cartItems = []
    
    for (const item of items) {
      const product = await productService.getProduct(item.productId)
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      const productAny = product as any
      if (productAny.isActive === false || product.status !== 'ACTIVE') {
        throw new Error(`Product ${product.name} is no longer available`)
      }

      const isAvailable = await productService.checkInventoryAvailability(
        item.productId,
        item.quantity
      )

      if (!isAvailable) {
        const inventory = productAny.inventory ?? 0
        throw new Error(
          `Insufficient inventory for ${product.name}. Only ${inventory} available`
        )
      }

      cartItems.push({
        productId: product.id,
        quantity: item.quantity,
        product,
      })
    }

    return cartItems
  }

  private async processCODPayment(
    orderId: string,
    cartItems: any[],
    summary: any,
    data: CheckoutData
  ) {
    try {
      // Prepare order data
      const orderData = {
        userId: data.userId!,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: (item.product as any).discountPrice || (item.product as any).price || Number(item.product.basePrice),
        })),
        total: summary.total,
        shippingAddress: data.shippingAddress,
        stripePaymentIntentId: orderId, // Use orderId as transaction reference for COD
      }

      let order
      if (data.userId) {
        order = await orderService.createOrder(orderData)
      } else {
        order = await orderService.createGuestOrder({
          guestEmail: data.guestEmail!,
          guestName: data.shippingAddress?.fullName || 'Guest Customer',
          items: orderData.items,
          total: orderData.total,
          grandTotal: orderData.total,
          shippingAddress: orderData.shippingAddress,
          stripePaymentIntentId: orderId,
        })
      }

      // Send confirmation email
      await this.sendOrderConfirmation(order, {
        guestEmail: data.guestEmail,
        userId: data.userId
      })

      logger.info('COD order created successfully', {
        orderId: order.id,
        amount: summary.total
      })

      return {
        success: true,
        orderId: order.id,
        transactionId: orderId,
        method: 'cod',
        amount: summary.total,
        orderCreated: true,
      }

    } catch (error) {
      logger.error('Failed to process COD payment', { error, orderId })
      throw new Error('Payment successful but order creation failed')
    }
  }

  private async storePaymentSession(orderId: string, sessionData: PaymentSession) {
    const cacheKey = `${this.sessionPrefix}${orderId}`
    await cache.set(cacheKey, sessionData, {
      ttl: this.sessionTTL,
      tags: ['checkout', `checkout:${orderId}`]
    })
  }

  private async clearPaymentSession(orderId: string) {
    const cacheKey = `${this.sessionPrefix}${orderId}`
    await cache.del(cacheKey)
  }

  private async createOrderFromSession(sessionData: PaymentSession, transactionId: string) {
    const orderData = {
      userId: sessionData.userId!,
      items: sessionData.cartItems,
      total: sessionData.amount,
      shippingAddress: sessionData.shippingAddress,
      stripePaymentIntentId: transactionId,
    }

    if (sessionData.userId) {
      return await orderService.createOrder(orderData)
    } else {
      return await orderService.createGuestOrder({
        guestEmail: sessionData.guestEmail!,
        guestName: sessionData.shippingAddress?.fullName || 'Guest Customer',
        items: sessionData.cartItems,
        total: sessionData.amount,
        grandTotal: sessionData.amount,
        shippingAddress: sessionData.shippingAddress,
        stripePaymentIntentId: transactionId,
      })
    }
  }

  private async sendOrderConfirmation(order: any, sessionData: any) {
    try {
      const userEmail = sessionData.guestEmail || order.user?.email
      if (!userEmail) return

      const user = order.user || {
        id: 'guest',
        name: sessionData.shippingAddress?.fullName || 'Guest Customer',
        email: userEmail,
      }

      await EmailService.sendOrderConfirmation({
        order,
        user,
        orderItems: order.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
      })

      logger.info('Order confirmation email sent', {
        orderId: order.id,
        email: userEmail
      })
    } catch (error) {
      logger.error('Failed to send order confirmation email', {
        error,
        orderId: order.id
      })
      // Don't throw error for email failures
    }
  }
}

export const checkoutService = new CheckoutService()