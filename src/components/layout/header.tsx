'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from 'next-auth/react'
import Button from '@/components/ui/button'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import ProfileDropdown from './profile-dropdown'
import CartIcon from '@/components/cart/cart-icon'
import SearchAutocomplete from '@/components/search/search-autocomplete'
import MobileSearchModal from '@/components/search/mobile-search-modal'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Our Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

export default function Header() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Hide search bar when on search page to avoid duplicate
  const isOnSearchPage = pathname === '/search'

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Close profile dropdown when opening mobile menu
    if (!isMobileMenuOpen) {
      setIsProfileDropdownOpen(false)
    }
  }

  const renderNavLinks = (className = '') =>
    NAV_LINKS.map((link) => {
      const isActive = pathname === link.href
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-all duration-200 relative group ${
            isActive ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
          } ${className}`}
        >
          {link.label}
          <span
            className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full ${
              isActive ? 'w-full' : ''
            }`}
          />
        </Link>
      )
    })

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      menuPanelRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleEsc)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isMobileMenuOpen])

  const Logo = () => (
    <Link href="/" className="flex items-center group" aria-label="Home">
      <div className="relative">
        <Image
          src="/logo.png"
          alt="Logo"
          width={96}
          height={96}
          className="h-20 w-20 md:h-24 md:w-24 object-contain transition-transform group-hover:scale-105"
          priority
        />
      </div>
    </Link>
  )

  const ProfileAvatar = () => (
    <button
      onClick={() => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen)
        if (!isProfileDropdownOpen) setIsMobileMenuOpen(false)
      }}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-semibold text-white">
        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
      </div>
      <span className="text-sm hidden lg:block text-gray-700 font-medium">{user?.name || 'Account'}</span>
      <ChevronDownIcon
        className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
      />
    </button>
  )

  if (!isClient) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden lg:flex items-center gap-8">{renderNavLinks()}</nav>
          </div>

          {/* Search Bar */}
          {!isOnSearchPage && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <SearchAutocomplete
                className="w-full"
                inputClassName="rounded-full bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                iconClassName="h-5 w-5 text-gray-400"
              />
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search products"
            >
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Cart Icon */}
            <CartIcon
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              iconClassName="h-6 w-6"
              badgeClassName="bg-orange-500 text-white"
            />

            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <ProfileAvatar />
                <ProfileDropdown
                  user={user!}
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600 shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMobileMenuOpen}
        suppressHydrationWarning
      >
        <div
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        <div
          ref={menuPanelRef}
          tabIndex={-1}
          className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-gray-100 bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Navigation</p>
              <p className="text-base font-semibold text-gray-900">Explore KALKAL</p>
            </div>
            <button
              onClick={closeMobileMenu}
              className="rounded-full border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {!isOnSearchPage && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <SearchAutocomplete
                className="w-full"
                onClose={closeMobileMenu}
                inputClassName="rounded-2xl bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                iconClassName="h-5 w-5 text-gray-400"
              />
            </div>
          )}

          <div className="px-6 py-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Main links</p>
              <div className="space-y-1">
                {renderNavLinks(
                  'block rounded-2xl px-4 py-3 text-base font-semibold text-gray-800 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 transition-all'
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Your space</p>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || 'Welcome back'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-gray-700 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-gray-700 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    <UserIcon className="h-5 w-5" />
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 text-orange-700 font-semibold"
                      onClick={closeMobileMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut()
                      closeMobileMenu()
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Sign in to track orders and access personalized recommendations.
                  </p>
                  <Link
                    href="/auth/signin"
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full rounded-xl bg-orange-500 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-orange-500/30"
                    onClick={closeMobileMenu}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">Need help?</p>
              <p className="text-gray-600">Reach our support team anytime at support@kalkal.com.</p>
            </div>
          </div>
        </div>
      </div>

      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </header>
  )
}