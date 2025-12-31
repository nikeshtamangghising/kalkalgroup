import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" suppressHydrationWarning>
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2" suppressHydrationWarning>
            <div className="flex items-center mb-6">
              <Image
                src="/logo.png"
                alt="Logo"
                width={96}
                height={96}
                className="h-20 w-20 object-contain"
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Kal Kal Group is an industrial organization committed to building a healthy and prosperous nation through economic transformation. Rooted in nationalism and strengthened by collective cooperation, the company brings people from all backgrounds together to produce and market natural health-promoting products. Through entrepreneurship and innovation, Kal Kal Group aims to drive economic empowerment and become a trusted name for all Nepalis.
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-1">📍 Kathmandu, Nepal</p>
              <p className="mb-1">🕒 Open daily 9:00 AM - 5:00 PM</p>
              <p>📞 Contact us for inquiries</p>
            </div>
          </div>

          {/* Quick Links */}
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3" suppressHydrationWarning>
              <li suppressHydrationWarning>
                <Link href="/" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Home
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/products" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Our Products
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/gallery" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold text-white mb-6">
              Customer Care
            </h3>
            <ul className="space-y-3" suppressHydrationWarning>
              <li suppressHydrationWarning>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/shipping" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/returns" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/faq" className="text-gray-300 hover:text-orange-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li suppressHydrationWarning>
                <Link href="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
              <p className="text-gray-300 text-sm">Get the latest updates on new products and exclusive offers.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4" suppressHydrationWarning>
          <p className="text-gray-400 text-sm text-center md:text-left">
            © 2024 All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex gap-2">
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-colors">
                  <span className="text-sm">f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-colors">
                  <span className="text-sm">ig</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}