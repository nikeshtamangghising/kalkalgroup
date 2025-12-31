'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface ProfileDropdownProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export default function ProfileDropdown({ user, isOpen, onClose }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-[18rem] rounded-2xl bg-white/95 shadow-2xl shadow-black/5 backdrop-blur border border-gray-100 focus:outline-none z-50"
      suppressHydrationWarning
    >
      <div className="py-3" suppressHydrationWarning>
        {/* User Info */}
        <div className="px-5 pb-4 border-b border-gray-100" suppressHydrationWarning>
          <div className="flex items-center gap-3" suppressHydrationWarning>
            <div className="relative" suppressHydrationWarning>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg shadow-inner shadow-black/10">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2" suppressHydrationWarning>
          <nav className="flex flex-col gap-1 px-2">
            {[
              { href: '/account', label: 'My Account' },
              { href: '/orders', label: 'My Orders' },
              { href: '/addresses', label: 'Address Book' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                onClick={onClose}
                suppressHydrationWarning
              >
                {item.label}
                <span className="text-xs text-gray-400">›</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="border-t border-gray-100 pt-3 px-5" suppressHydrationWarning>
          <button
            onClick={handleSignOut}
            className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            suppressHydrationWarning
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

