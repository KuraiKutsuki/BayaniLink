import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AdminDashboard from '@/components/AdminDashboard'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Admin Dashboard - BayaniLink',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Fetch initial emergency reports
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reports:', error)
  }

  // Logout action
  async function logout() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between w-full">
          {/* Logo & Brand */}
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/BayaniLink.png" 
                alt="BayaniLink Logo" 
                width={36} 
                height={36} 
                priority 
                style={{ width: '36px', height: '36px' }} 
              />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold text-base leading-none transition-colors duration-300">
                BayaniLink
              </h1>
              <p className="text-gray-500 dark:text-gray-500 text-[10px] mt-0.5 font-medium tracking-wide uppercase">
                CDRRMO ADMIN PORTAL
              </p>
            </div>
          </Link>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Visual Separator */}
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

            {/* Session Group */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  Active Operator
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign Out"
                  className="flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:px-4 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none touch-manipulation active:scale-95"
                >
                  <LogOut size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6 text-center shadow-sm">
            <h2 className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
              Database Connection Error
            </h2>
            <p className="text-xs text-red-700 dark:text-red-300">
              Failed to connect to the database to fetch emergency reports. Please check your Supabase credentials.
            </p>
          </div>
        ) : (
          <AdminDashboard initialReports={reports || []} />
        )}
      </main>
    </div>
  )
}
