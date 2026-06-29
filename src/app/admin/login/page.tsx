import { login } from './actions'
import { AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'LGU Login - BayaniLink',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

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
            <input
              name="password"
              type="password"
              required
              placeholder="Enter password"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-950 font-bold
              text-sm tracking-wide shadow-md shadow-gray-900/10 hover:bg-gray-800 dark:hover:bg-white active:bg-gray-950 dark:active:bg-gray-200
              active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  </div>
  )
}
