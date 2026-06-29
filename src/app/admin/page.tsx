import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'

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

  // Logout action
  async function logout() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center animate-modal-in">
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Logged in as <span className="font-semibold text-gray-700 dark:text-gray-200">{user.email}</span>
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl text-sm text-blue-800 dark:text-blue-300 mb-8 text-left">
          <p><strong>Note:</strong> This is a placeholder for Phase 5.</p>
          <p className="mt-1">The full interactive dashboard (Phase 8) will display real-time maps and the incident report list here.</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>

      </div>
    </div>
  )
}
