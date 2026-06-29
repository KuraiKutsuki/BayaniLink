'use client'

import { Database } from '@/types/database.types'
import { AlertCircle, Clock, CheckCircle2, BarChart3 } from 'lucide-react'

type ReportRow = Database['public']['Tables']['reports']['Row']

interface AnalyticsChartsProps {
  reports: ReportRow[]
}

export default function AnalyticsCharts({ reports }: AnalyticsChartsProps) {
  const total = reports.length

  const submitted = reports.filter((r) => r.status === 'Submitted').length
  const inProgress = reports.filter((r) => r.status === 'In Progress').length
  const resolved = reports.filter((r) => r.status === 'Resolved').length

  // Calculate count by category
  const categories = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Stat Cards */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Total Reports
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {total}
          </p>
        </div>
        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg flex items-center justify-center border border-gray-100 dark:border-gray-700/50">
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Submitted (Pending)
          </p>
          <p className="text-2xl font-black text-red-600 dark:text-red-500">
            {submitted}
          </p>
        </div>
        <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 rounded-lg flex items-center justify-center border border-red-100/50 dark:border-red-900/30">
          <AlertCircle size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            In Progress
          </p>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-500">
            {inProgress}
          </p>
        </div>
        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-500 rounded-lg flex items-center justify-center border border-orange-100/50 dark:border-orange-900/30">
          <Clock size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Resolved
          </p>
          <p className="text-2xl font-black text-green-600 dark:text-green-500">
            {resolved}
          </p>
        </div>
        <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-500 rounded-lg flex items-center justify-center border border-green-100/50 dark:border-green-900/30">
          <CheckCircle2 size={20} />
        </div>
      </div>

      {/* Category breakdown progress bars */}
      {total > 0 && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Incidents by Category
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {sortedCategories.map(([category, count]) => {
              const percentage = Math.round((count / total) * 100)
              
              let colorClass = 'bg-gray-600 dark:bg-gray-400'
              if (category === 'Fire' || category === 'Crash') {
                colorClass = 'bg-red-600 dark:bg-red-500'
              } else if (category === 'Flood') {
                colorClass = 'bg-blue-600 dark:bg-blue-500'
              } else if (category === 'Dangling Wire') {
                colorClass = 'bg-orange-500 dark:bg-orange-500'
              } else if (category === 'Medical') {
                colorClass = 'bg-green-600 dark:bg-green-500'
              }

              return (
                <div key={category} className="flex flex-col">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
