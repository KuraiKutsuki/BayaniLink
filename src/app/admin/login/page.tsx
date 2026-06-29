import { login } from './actions'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

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
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
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
              placeholder="admin@ligao.gov.ph"
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
              placeholder="••••••••"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 rounded-xl bg-red-600 text-white font-bold
              text-sm tracking-wide shadow-md shadow-red-900/10 hover:bg-red-700 active:bg-red-800
              active:scale-[0.98] transition-all duration-200"
          >
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
