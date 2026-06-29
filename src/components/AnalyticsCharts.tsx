'use client'

import { Database } from '@/types/database.types'
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Waves, Flame, Car, Zap, HeartPulse, CircleAlert } from 'lucide-react'

type ReportRow = Database['public']['Tables']['reports']['Row']

interface AnalyticsChartsProps {
  reports: ReportRow[]
}

const CATEGORY_ICONS: Record<string, any> = {
  Flood: Waves,
  Fire: Flame,
  Crash: Car,
  'Dangling Wire': Zap,
  Medical: HeartPulse,
  Other: CircleAlert,
}

// ── Native SVG Donut Chart ──────────────────────────────────────────────────
function StatusDonut({ 
  submitted, 
  inProgress, 
  resolved, 
  total 
}: { 
  submitted: number
  inProgress: number
  resolved: number
  total: number 
}) {
  const radius = 38
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius // ~238.76
  
  if (total === 0) {
    return (
      <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-800/40"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-gray-400 dark:text-gray-600">0</span>
          <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-wider leading-none mt-0.5">Reports</span>
        </div>
      </div>
    )
  }

  const pSubmitted = (submitted / total) * 100
  const pInProgress = (inProgress / total) * 100
  const pResolved = (resolved / total) * 100

  const lSubmitted = (pSubmitted / 100) * circumference
  const lInProgress = (pInProgress / 100) * circumference
  const lResolved = (pResolved / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-gray-100 dark:text-gray-800/40"
          strokeWidth={strokeWidth}
        />
        {/* Resolved segment (Green) */}
        {lResolved > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#16a34a"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lResolved} ${circumference}`}
            strokeDashoffset={0}
            className="transition-all duration-500 ease-out"
          />
        )}
        {/* In Progress segment (Orange) */}
        {lInProgress > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#ea580c"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lInProgress} ${circumference}`}
            strokeDashoffset={-lResolved}
            className="transition-all duration-500 ease-out"
          />
        )}
        {/* Submitted segment (Red) */}
        {lSubmitted > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#dc2626"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lSubmitted} ${circumference}`}
            strokeDashoffset={-(lResolved + lInProgress)}
            className="transition-all duration-500 ease-out"
          />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
          {total}
        </span>
        <span className="text-[7px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-wider mt-0.5 leading-none">
          Total
        </span>
      </div>
    </div>
  )
}

export default function AnalyticsCharts({ reports }: AnalyticsChartsProps) {
  const total = reports.length

  const submitted = reports.filter((r) => r.status === 'Submitted').length
  const inProgress = reports.filter((r) => r.status === 'In Progress').length
  const resolved = reports.filter((r) => r.status === 'Resolved').length

  const pSubmitted = total > 0 ? Math.round((submitted / total) * 100) : 0
  const pInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0
  const pResolved = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Calculate count by category
  const categories = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Card 1: Status Distribution (2/3 width) */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Status Distribution
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center justify-center py-2 shrink-0">
              <StatusDonut
                submitted={submitted}
                inProgress={inProgress}
                resolved={resolved}
                total={total}
              />
            </div>
            
            {/* Legend / Metrics List - Stacked Vertically as Rows */}
            <div className="flex-1 w-full flex flex-col gap-3">
              {/* Submitted Item */}
              <div className="border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-955/15 rounded-xl p-3 flex flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#dc2626' }} />
                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                    {submitted}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-red-655 dark:text-red-500">
                    {pSubmitted}%
                  </span>
                </div>
              </div>

              {/* In Progress Item */}
              <div className="border border-orange-200 dark:border-orange-900/30 bg-orange-50/40 dark:bg-orange-955/15 rounded-xl p-3 flex flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ea580c' }} />
                  <span className="text-[9px] font-bold text-gray-555 dark:text-gray-400 uppercase tracking-wider">
                    In Progress
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                    {inProgress}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-orange-655 dark:text-orange-500">
                    {pInProgress}%
                  </span>
                </div>
              </div>

              {/* Resolved Item */}
              <div className="border border-green-200 dark:border-green-900/30 bg-green-50/40 dark:bg-green-955/15 rounded-xl p-3 flex flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#16a34a' }} />
                  <span className="text-[9px] font-bold text-gray-555 dark:text-gray-400 uppercase tracking-wider">
                    Resolved
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                    {resolved}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-655 dark:text-green-500">
                    {pResolved}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Incidents by Category (1/3 width) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Incidents by Category
            </p>
            
            {total > 0 ? (
              <div className="space-y-3.5">
                {sortedCategories.map(([category, count]) => {
                  const percentage = Math.round((count / total) * 100)
                  const CatIcon = CATEGORY_ICONS[category] || CircleAlert
                  
                  return (
                    <div key={category} className="flex flex-col">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <div className="flex items-center gap-2">
                          <CatIcon size={14} className="text-gray-400 dark:text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{category}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 tabular-nums">{count} ({percentage}%)</span>
                      </div>
                      <div className="relative w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                        {/* Background ticks */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none z-10">
                          <span className="w-px h-full bg-white/30 dark:bg-gray-900/40" style={{ marginLeft: '25%' }} />
                          <span className="w-px h-full bg-white/30 dark:bg-gray-900/40" style={{ marginLeft: '50%' }} />
                          <span className="w-px h-full bg-white/30 dark:bg-gray-900/40" style={{ marginLeft: '75%' }} />
                        </div>
                        {/* Bar */}
                        <div 
                          className="h-full bg-slate-600 dark:bg-slate-500 transition-all duration-500 ease-out rounded-full relative z-0"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="text-gray-300 dark:text-gray-700 mb-2 animate-pulse" size={24} />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  No reports to categorize
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                  Adjust filters to show data
                </p>
              </div>
            )}
          </div>

          {/* X-Axis Chart Scale at bottom */}
          {total > 0 && (
            <div className="flex justify-between text-[8px] font-bold text-gray-400 dark:text-gray-600 px-1 pt-2.5 border-t border-gray-150 dark:border-gray-800/80 mt-5 leading-none">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
