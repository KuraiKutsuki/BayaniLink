'use client'

import { useState, use } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from './actions'
import { AlertTriangle, ShieldCheck, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = use(searchParams)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center mb-4 border border-gray-200/50 dark:border-gray-700/50">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Sign in to manage and coordinate emergency reports for Ligao City.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-500/40 rounded-xl px-4 py-3">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <form action={login} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter email address"
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                  rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                    rounded-xl pl-4 pr-11 py-3 text-gray-900 dark:text-white text-sm
                    placeholder:text-gray-400 dark:placeholder:text-gray-600
                    focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-605 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 mt-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-700/60 text-white font-bold
        text-sm tracking-wide shadow-md shadow-red-600/15 active:scale-[0.98]
        transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span>Signing In...</span>
        </span>
      ) : (
        'Sign In to Dashboard'
      )}
    </button>
  )
}
