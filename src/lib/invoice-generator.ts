import { DEFAULT_CURRENCY } from '@/lib/currency'

// Simple PDF-friendly currency formatting
function formatCurrencyForPDF(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const symbol = currency === 'NPR' ? 'Rs.' : 'Rs.'
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol} ${formattedAmount}`
}

interface InvoiceOrder {
  id: string
  userId: string
  status: string
  total: number
  createdAt: Date
  stripePaymentIntentId: string | null
  user: {
    id: string
    name: string
    email: string
    createdAt: Date
    role: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      currency?: string
      category?: {
        name: string
      }
    }
  }>
  shippingAddress?: {
    fullName: string
    email?: string
    phone?: string
    address: string
    city: string
    postalCode: string
    country?: string
  } | null
}

async function generateEnhancedInvoice(
  doc: any,
  order: InvoiceOrder,
  subtotal: number,
  tax: number,
  shipping: number,
  total: number
) {
  // Set colors
  const primaryColor = [41, 128, 185] // Blue
  const secondaryColor = [52, 73, 94] // Dark gray
  const lightGray = [236, 240, 241]

  // Header with company branding
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 20, 25)

  // Invoice details in header
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice #: ${order.id.slice(-8).toUpperCase()}`, 140, 20)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 28)
  doc.text(`Status: ${order.status.toUpperCase()}`, 140, 36)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Company info
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Kal Kal Group', 20, 55)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Bode, Bhaktapur', 20, 62)
  doc.text('Phone: 9851323260 | 9763419088', 20, 68)
  doc.text('info@kalkalgroup.com', 20, 74)

  // Customer info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 120, 55)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(order.user.name, 120, 62)
  doc.text(order.user.email, 120, 68)

  if (order.shippingAddress) {
    doc.text(order.shippingAddress.address, 120, 74)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 120, 80)
    if (order.shippingAddress.country) {
      doc.text(order.shippingAddress.country, 120, 86)
    }
  }

  // Summary metrics cards
  const summaryY = 100
  const summaryData = [
    { label: 'Subtotal', value: formatCurrencyForPDF(subtotal, DEFAULT_CURRENCY) },
    { label: 'Tax', value: formatCurrencyForPDF(tax, DEFAULT_CURRENCY) },
    { label: 'Shipping', value: shipping === 0 ? 'FREE' : formatCurrencyForPDF(shipping, DEFAULT_CURRENCY) },
    { label: 'Total Paid', value: formatCurrencyForPDF(total, DEFAULT_CURRENCY), accent: true },
  ]

  summaryData.forEach((metric, index) => {
    const cardWidth = 42
    const x = 20 + index * (cardWidth + 3)

    doc.setFillColor(...(metric.accent ? primaryColor : lightGray))
    doc.roundedRect(x, summaryY, cardWidth, 28, 3, 3, 'F')
    doc.setTextColor(metric.accent ? 255 : secondaryColor[0], metric.accent ? 255 : secondaryColor[1], metric.accent ? 255 : secondaryColor[2])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(metric.label.toUpperCase(), x + 4, summaryY + 8)
    doc.setFontSize(11)
    doc.setFont('helvetica', metric.accent ? 'bold' : 'normal')
    doc.text(metric.value, x + 4, summaryY + 20)
  })

  // Items table header
  const tableStartY = summaryY + 40
  doc.setFillColor(...lightGray)
  doc.rect(20, tableStartY, 170, 10, 'F')

  doc.setTextColor(...secondaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Product', 25, tableStartY + 7)
  doc.text('Qty', 120, tableStartY + 7)
  doc.text('Price', 140, tableStartY + 7)
  doc.text('Total', 170, tableStartY + 7)

  // Items
  let currentY = tableStartY + 15
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(20, currentY - 5, 170, 10, 'F')
    }

    doc.text(item.product.name, 25, currentY)
    doc.text(item.quantity.toString(), 125, currentY)
    doc.text(formatCurrencyForPDF(item.price, item.product.currency || DEFAULT_CURRENCY), 145, currentY)
    doc.text(formatCurrencyForPDF(itemTotal, item.product.currency || DEFAULT_CURRENCY), 175, currentY)

    currentY += 12
  })

  // Totals section
  const totalsY = currentY + 10
  doc.setDrawColor(...secondaryColor)
  doc.line(120, totalsY, 190, totalsY)

  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 130, totalsY + 10)
  doc.text(formatCurrencyForPDF(subtotal, DEFAULT_CURRENCY), 175, totalsY + 10)

  doc.text('Tax (13%):', 130, totalsY + 18)
  doc.text(formatCurrencyForPDF(tax, DEFAULT_CURRENCY), 175, totalsY + 18)

  doc.text('Shipping:', 130, totalsY + 26)
  doc.text(shipping === 0 ? 'FREE' : formatCurrencyForPDF(shipping, DEFAULT_CURRENCY), 175, totalsY + 26)

  // Total with full-width background bar
  const totalBarY = totalsY + 32
  doc.setFillColor(...primaryColor)
  doc.roundedRect(20, totalBarY, 170, 16, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL', 30, totalBarY + 11)
  doc.text(formatCurrencyForPDF(total, DEFAULT_CURRENCY), 180, totalBarY + 11, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)

  // Footer
  doc.setTextColor(128, 128, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for your business!', 20, 270)
  doc.text('For questions about this invoice, contact info@kalkalgroup.com', 20, 276)

  if (order.stripePaymentIntentId) {
    doc.text(`Payment ID: ${order.stripePaymentIntentId}`, 20, 282)
  }
}

export async function generateInvoicePDF(order: InvoiceOrder): Promise<Buffer> {
  console.log('Starting enhanced PDF generation for order:', order.id)

  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.13
    const shipping = subtotal >= 2000 ? 0 : 200
    const total = subtotal + tax + shipping

    // Generate enhanced invoice
    await generateEnhancedInvoice(doc, order, subtotal, tax, shipping, total)

    // Convert to buffer
    const pdfOutput = doc.output('arraybuffer')
    const buffer = Buffer.from(pdfOutput)

    console.log('Enhanced PDF generation completed, buffer size:', buffer.length)
    return buffer

  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}