import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/session-provider'
import { CartProvider } from '@/contexts/cart-context'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ChunkErrorHandler from '@/components/chunk-error-handler'
import PerformanceMonitor from '@/components/performance/performance-monitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Premium Online Store - Quality Products & Fast Shipping',
    template: '%s | Premium Store'
  },
  description: 'Premium e-commerce platform with curated products, fast shipping, and exceptional customer service. Discover amazing products at great prices.',
  keywords: ['ecommerce', 'online shopping', 'products', 'retail', 'marketplace'],
  authors: [{ name: 'Store Team' }],
  creator: 'Premium Store',
  publisher: 'Premium Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Premium Store',
    title: 'Premium Online Store - Quality Products & Fast Shipping',
    description: 'Premium e-commerce platform with curated products and exceptional shopping experience',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Premium Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Online Store - Quality Products & Fast Shipping',
    description: 'Premium e-commerce platform with curated products and exceptional shopping experience',
    creator: '@premiumstore',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'ecommerce',
  classification: 'E-Commerce Platform',
  referrer: 'origin-when-cross-origin',
  applicationName: 'Premium Store',
  appleWebApp: {
    capable: true,
    title: 'Premium Store',
    statusBarStyle: 'default',
  },
  manifest: '/manifest.json',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Premium Store" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Premium Store" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4f46e5" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        {/* Favicon */}
        <link rel="icon" href="/fav.png" />
        <link rel="shortcut icon" href="/fav.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/fav.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/fav.png" />

        {/* Preload critical resources (fonts served via next/font) */}

        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="//js.stripe.com" />
        <link rel="dns-prefetch" href="//api.stripe.com" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ChunkErrorHandler />
        <PerformanceMonitor />
        <AuthSessionProvider session={session}>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}