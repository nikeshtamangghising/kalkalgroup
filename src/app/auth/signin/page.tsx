'use client'

import { useMemo, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type FieldErrors = {
  email?: string
  password?: string
}

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const searchParams = useSearchParams()
  const router = useRouter()

  const redirectParam = searchParams?.get('redirect')
  const targetRedirect = useMemo(() => (redirectParam ? redirectParam : '/'), [redirectParam])

  const validateForm = () => {
    const errors: FieldErrors = {}
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      errors.password = 'Password is required'
    } else if (password.trim().length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!validateForm()) return

    try {
      setStatus('loading')
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Invalid email or password. Please try again.')
        setStatus('idle')
        return
      }

      const session = await getSession()
      if (session?.user?.role === 'ADMIN' && !targetRedirect.startsWith('/admin')) {
        router.push('/admin')
        return
      }

      router.push(targetRedirect)
    } catch (error) {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setStatus('idle')
    }
  }

  const inputBase =
    'flex items-center gap-3 rounded-xl border border-[#E0E0E0] bg-white px-4 text-[16px] text-[#333] focus-within:border-[#1B4332] focus-within:ring-4 focus-within:ring-[#1B4332]/15 transition'

  const inputFieldClass = 'h-12 flex-1 bg-transparent text-base placeholder-[#999] focus:outline-none'

  const renderFieldError = (message?: string) =>
    message ? (
      <p className="mt-2 text-sm text-[#E53935]" role="alert">
        {message}
      </p>
    ) : null

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E4E8ED] px-4 py-10 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(27,67,50,0.12),_transparent_50%)]" aria-hidden />
      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-center justify-center gap-10 lg:flex-row">
        <div className="w-full max-w-xl rounded-[32px] bg-[#1B4332] p-10 text-white shadow-[0_40px_120px_rgba(0,0,0,0.2)]">
          <div className="text-sm uppercase tracking-[0.5em] text-white/70">Kal Kal Group</div>
          <h1 className="mt-6 text-4xl font-semibold">Welcome Back</h1>
          <p className="mt-4 text-white/80">
            Secure access for administrators, content managers, and trusted partners. Keep Kal Kal’s experience consistent across every touchpoint.
          </p>
          <ul className="mt-8 space-y-4 text-white/85">
            {['Encrypted sessions & CSRF protection', 'Role-aware dashboard access', 'Fast response & support'].map(item => (
              <li className="flex items-center gap-3" key={item}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg">✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
            Need help? <a className="font-semibold text-white hover:underline" href="mailto:support@kalkalgroup.com">Contact support</a>
          </div>
          <p className="mt-10 text-sm text-white/70">© {new Date().getFullYear()} Kal Kal Group · All rights reserved</p>
        </div>

        <div className="w-full max-w-md rounded-[28px] bg-white/95 px-6 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto w-fit rounded-2xl border border-[#F0E6D4] px-6 py-2 text-sm font-semibold text-[#1B4332]">KAL KAL GROUP</div>
            <h2 className="mt-6 text-3xl font-semibold text-[#1B4332]">Admin Portal</h2>
            <p className="mt-2 text-base text-[#5C5C5C]">Sign in to access your dashboard</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="text-sm font-medium text-[#333]" htmlFor="signin-email">
                Email address
              </label>
              <div
                className={`${inputBase} mt-2 ${fieldErrors.email ? 'border-[#E53935] bg-[#FFEBEE]/60 focus-within:border-[#E53935] focus-within:ring-[#E53935]/20' : ''}`}
              >
                <EnvelopeIcon className="h-5 w-5 text-[#999]" aria-hidden />
                <input
                  autoComplete="email"
                  className={inputFieldClass}
                  id="signin-email"
                  name="email"
                  onChange={event => {
                    setEmail(event.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: undefined }))
                    }
                  }}
                  placeholder="admin@kalkalgroup.com"
                  type="email"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </div>
              {renderFieldError(fieldErrors.email)}
            </div>

            <div>
              <label className="text-sm font-medium text-[#333]" htmlFor="signin-password">
                Password
              </label>
              <div
                className={`${inputBase} mt-2 ${fieldErrors.password ? 'border-[#E53935] bg-[#FFEBEE]/60 focus-within:border-[#E53935] focus-within:ring-[#E53935]/20' : ''}`}
              >
                <LockClosedIcon className="h-5 w-5 text-[#999]" aria-hidden />
                <input
                  autoComplete="current-password"
                  className={inputFieldClass}
                  id="signin-password"
                  name="password"
                  onChange={event => {
                    setPassword(event.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: undefined }))
                    }
                  }}
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-[#999] transition hover:text-[#1B4332]"
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {renderFieldError(fieldErrors.password)}
            </div>

            <div className="flex flex-col gap-3 text-sm text-[#666] sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  checked={rememberMe}
                  className="h-4 w-4 rounded border-[#D0D0D0] text-[#1B4332] focus:ring-[#1B4332]"
                  type="checkbox"
                  onChange={event => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <a className="font-semibold text-[#1B4332] hover:underline" href="mailto:support@kalkalgroup.com">
                Forgot password?
              </a>
            </div>

            {formError && (
              <div className="rounded-2xl border border-[#FFCDD2] bg-[#FFEBEE] px-4 py-3 text-sm text-[#B71C1C]" role="alert">
                {formError}
              </div>
            )}

            <button
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1B4332] font-semibold text-white shadow-[0_15px_30px_rgba(27,67,50,0.4)] transition hover:-translate-y-0.5 hover:bg-[#153728] focus:outline-none focus:ring-4 focus:ring-[#1B4332]/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === 'loading'}
              type="submit"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#F0F0F0] pt-6 text-center text-sm text-[#999]">
            🔒 Secure admin access · Sessions protected with encryption.
          </div>
          <div className="mt-4 text-center text-sm">
            <Link className="font-medium text-[#1B4332] hover:underline" href="/">
              ← Back to main website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}