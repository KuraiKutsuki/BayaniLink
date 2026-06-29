'use client'

import { useState } from 'react'
import { Database } from '@/types/database.types'
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Waves, Flame, Car, Zap, HeartPulse, CircleAlert } from 'lucide-react'

type ReportRow = Database['public']['Tables']['reports']['Row']

interface AnalyticsChartsProps {
  reports: ReportRow[]
  allCategoryReports?: ReportRow[]
  allStatusReports?: ReportRow[]
  activeCategory?: string
  onSelectCategory?: (category: string) => void
  activeStatus?: string
  onSelectStatus?: (status: string) => void
}

const CATEGORY_ICONS: Record<string, any> = {
  Flood: Waves,
  Fire: Flame,
  Crash: Car,
  'Dangling Wire': Zap,
  Medical: HeartPulse,
  Other: CircleAlert,
}

const CATEGORY_COLORS: Record<string, { bar: string; icon: string; ring: string; bg: string }> = {
  Flood: { 
    bar: 'bg-blue-600 dark:bg-blue-500', 
    icon: 'text-blue-500 dark:text-blue-400',
    ring: 'ring-blue-500/30 dark:ring-blue-500/20',
    bg: 'bg-blue-50/50 dark:bg-blue-950/15'
  },
  Fire: { 
    bar: 'bg-orange-600 dark:bg-orange-500', 
    icon: 'text-orange-500 dark:text-orange-400',
    ring: 'ring-orange-500/30 dark:ring-orange-500/20',
    bg: 'bg-orange-50/50 dark:bg-orange-950/15'
  },
  Crash: { 
    bar: 'bg-amber-600 dark:bg-amber-500', 
    icon: 'text-amber-500 dark:text-amber-400',
    ring: 'ring-amber-500/30 dark:ring-amber-500/20',
    bg: 'bg-amber-50/50 dark:bg-amber-950/15'
  },
  'Dangling Wire': { 
    bar: 'bg-yellow-500 dark:bg-yellow-400', 
    icon: 'text-yellow-500 dark:text-yellow-400',
    ring: 'ring-yellow-500/30 dark:ring-yellow-500/20',
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/15'
  },
  Medical: { 
    bar: 'bg-green-600 dark:bg-green-500', 
    icon: 'text-green-500 dark:text-green-400',
    ring: 'ring-green-500/30 dark:ring-green-500/20',
    bg: 'bg-green-50/50 dark:bg-green-950/15'
  },
  Other: { 
    bar: 'bg-gray-600 dark:bg-gray-500', 
    icon: 'text-gray-500 dark:text-gray-400',
    ring: 'ring-gray-500/30 dark:ring-gray-500/20',
    bg: 'bg-gray-50/50 dark:bg-gray-800/30'
  },
}

// ── Native SVG Donut Chart ──────────────────────────────────────────────────
function StatusDonut({ 
  submitted, 
  inProgress, 
  resolved, 
  total,
  activeStatus = 'All',
  onSelectStatus
}: { 
  submitted: number
  inProgress: number
  resolved: number
  total: number 
  activeStatus?: string
  onSelectStatus?: (status: string) => void
}) {
  const [hoveredSegment, setHoveredSegment] = useState<'Submitted' | 'In Progress' | 'Resolved' | null>(null)
  const [tappedSegment, setTappedSegment] = useState<'Submitted' | 'In Progress' | 'Resolved' | null>(null)
  const radius = 38
  const strokeWidth = 13
  const circumference = 2 * Math.PI * radius // ~238.76

  const pSubmitted = total > 0 ? Math.round((submitted / total) * 100) : 0
  const pInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0
  const pResolved = total > 0 ? Math.round((resolved / total) * 100) : 0

  const lSubmitted = (pSubmitted / 100) * circumference
  const lInProgress = (pInProgress / 100) * circumference
  const lResolved = (pResolved / 100) * circumference

  const activeDisplay = hoveredSegment || tappedSegment || (activeStatus && activeStatus !== 'All' ? activeStatus : null)

  let displayCount = total
  let displayLabel = 'Total'

  if (activeDisplay === 'Submitted') {
    displayCount = submitted
    displayLabel = `Submitted (${pSubmitted}%)`
  } else if (activeDisplay === 'In Progress') {
    displayCount = inProgress
    displayLabel = `In Progress (${pInProgress}%)`
  } else if (activeDisplay === 'Resolved') {
    displayCount = resolved
    displayLabel = `Resolved (${pResolved}%)`
  }

  const getStrokeWidth = (status: 'Submitted' | 'In Progress' | 'Resolved') => {
    const isHovered = hoveredSegment === status
    const isTapped = tappedSegment === status
    const isSelected = activeStatus === status
    if (isHovered) return strokeWidth + 2.5
    if (isTapped) return strokeWidth + 2.0
    if (isSelected) return strokeWidth + 1.2
    return strokeWidth
  }
  
  if (total === 0) {
    return (
      <div className="relative flex items-center justify-center w-28 h-28 md:w-48 md:h-48 shrink-0">
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
          <span className="text-xl md:text-4xl font-black text-gray-400 dark:text-gray-600">0</span>
          <span className="text-[7px] md:text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-wider leading-none mt-0.5">Reports</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={() => setTappedSegment(null)}
      className="relative flex items-center justify-center w-28 h-28 md:w-48 md:h-48 shrink-0 cursor-pointer"
    >
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
          onClick={(e) => {
            e.stopPropagation()
            setTappedSegment(null)
          }}
        />
        {/* Resolved segment (Green) */}
        {lResolved > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#16a34a"
            strokeWidth={getStrokeWidth('Resolved')}
            strokeDasharray={`${lResolved} ${circumference}`}
            strokeDashoffset={0}
            onMouseEnter={() => setHoveredSegment('Resolved')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={(e) => {
              e.stopPropagation()
              setTappedSegment(current => current === 'Resolved' ? null : 'Resolved')
            }}
            className="cursor-pointer transition-all duration-300 ease-out"
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
            strokeWidth={getStrokeWidth('In Progress')}
            strokeDasharray={`${lInProgress} ${circumference}`}
            strokeDashoffset={-lResolved}
            onMouseEnter={() => setHoveredSegment('In Progress')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={(e) => {
              e.stopPropagation()
              setTappedSegment(current => current === 'In Progress' ? null : 'In Progress')
            }}
            className="cursor-pointer transition-all duration-300 ease-out"
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
            strokeWidth={getStrokeWidth('Submitted')}
            strokeDasharray={`${lSubmitted} ${circumference}`}
            strokeDashoffset={-(lResolved + lInProgress)}
            onMouseEnter={() => setHoveredSegment('Submitted')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={(e) => {
              e.stopPropagation()
              setTappedSegment(current => current === 'Submitted' ? null : 'Submitted')
            }}
            className="cursor-pointer transition-all duration-300 ease-out"
          />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <span className="text-xl md:text-4xl font-black text-gray-900 dark:text-white leading-none">
          {displayCount}
        </span>
        <span className="text-[6px] md:text-[9px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-wider mt-0.5 leading-none">
          {displayLabel}
        </span>
      </div>
    </div>
  )
}

export default function AnalyticsCharts({ 
  reports, 
  allCategoryReports,
  allStatusReports,
  activeCategory = 'All',
  onSelectCategory,
  activeStatus = 'All',
  onSelectStatus
}: AnalyticsChartsProps) {
  const statusSourceReports = allStatusReports || reports
  const total = statusSourceReports.length

  const submitted = statusSourceReports.filter((r) => r.status === 'Submitted').length
  const inProgress = statusSourceReports.filter((r) => r.status === 'In Progress').length
  const resolved = statusSourceReports.filter((r) => r.status === 'Resolved').length

  const pSubmitted = total > 0 ? Math.round((submitted / total) * 100) : 0
  const pInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0
  const pResolved = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Calculate count by category based on unfiltered (by category) reports
  const categorySourceReports = allCategoryReports || reports
  const totalCategory = categorySourceReports.length

  const categories = categorySourceReports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Ensure all standard categories exist in the list (even if count is 0)
  const allCategories = ['Flood', 'Fire', 'Crash', 'Dangling Wire', 'Medical', 'Other']
  allCategories.forEach((cat) => {
    if (categories[cat] === undefined) {
      categories[cat] = 0
    }
  })

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Card 1: Status Distribution (2/3 width) */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
        <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 shrink-0">
          Status Distribution
        </p>
        
        <div className="flex-1 flex flex-col md:flex-row items-center gap-6 md:gap-10 justify-center py-2">
          <div className="flex flex-col items-center justify-center shrink-0">
            <StatusDonut
              submitted={submitted}
              inProgress={inProgress}
              resolved={resolved}
              total={total}
              activeStatus={activeStatus}
              onSelectStatus={onSelectStatus}
            />
          </div>
          
          {/* Legend / Metrics List - Stacked Vertically as Rows */}
          <div className="w-full md:max-w-md flex flex-col gap-3 justify-center">
            {/* Submitted Item */}
            <div 
              onClick={() => onSelectStatus?.(activeStatus === 'Submitted' ? 'All' : 'Submitted')}
              className={`border transition-all cursor-pointer rounded-xl p-3 flex flex-row justify-between items-center gap-4 ${
                activeStatus === 'Submitted'
                  ? 'border-red-500 bg-red-100/60 dark:bg-red-950/40 ring-1 ring-red-500/30 shadow-xs'
                  : 'border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/15 hover:bg-red-100/20 dark:hover:bg-red-950/20'
              }`}
            >
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
                <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-500">
                  {pSubmitted}%
                </span>
              </div>
            </div>

            {/* In Progress Item */}
            <div 
              onClick={() => onSelectStatus?.(activeStatus === 'In Progress' ? 'All' : 'In Progress')}
              className={`border transition-all cursor-pointer rounded-xl p-3 flex flex-row justify-between items-center gap-4 ${
                activeStatus === 'In Progress'
                  ? 'border-orange-500 bg-orange-100/60 dark:bg-orange-950/40 ring-1 ring-orange-500/30 shadow-xs'
                  : 'border-orange-200 dark:border-orange-900/30 bg-orange-50/40 dark:bg-orange-950/15 hover:bg-orange-100/20 dark:hover:bg-orange-950/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ea580c' }} />
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  In Progress
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {inProgress}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-500">
                  {pInProgress}%
                </span>
              </div>
            </div>

            {/* Resolved Item */}
            <div 
              onClick={() => onSelectStatus?.(activeStatus === 'Resolved' ? 'All' : 'Resolved')}
              className={`border transition-all cursor-pointer rounded-xl p-3 flex flex-row justify-between items-center gap-4 ${
                activeStatus === 'Resolved'
                  ? 'border-green-500 bg-green-100/60 dark:bg-green-950/40 ring-1 ring-green-500/30 shadow-xs'
                  : 'border-green-200 dark:border-green-900/30 bg-green-50/40 dark:bg-green-950/15 hover:bg-green-100/20 dark:hover:bg-green-950/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#16a34a' }} />
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resolved
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {resolved}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-500">
                  {pResolved}%
                </span>
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
                  const percentage = totalCategory > 0 ? Math.round((count / totalCategory) * 100) : 0
                  const CatIcon = CATEGORY_ICONS[category] || CircleAlert
                  const colors = CATEGORY_COLORS[category] || { 
                    bar: 'bg-slate-600 dark:bg-slate-500', 
                    icon: 'text-gray-400 dark:text-gray-500',
                    ring: 'ring-gray-300 dark:ring-gray-700',
                    bg: 'bg-gray-100/50 dark:bg-gray-800/50'
                  }
                  const isSelected = activeCategory === category
                  
                  return (
                    <div 
                      key={category} 
                      onClick={() => onSelectCategory?.(isSelected ? 'All' : category)}
                      className={`flex flex-col p-1.5 -mx-1.5 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/40 select-none ${
                        isSelected 
                          ? `ring-1 ${colors.ring} ${colors.bg}` 
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <div className="flex items-center gap-2">
                          <CatIcon size={14} className={colors.icon} />
                          <span className={isSelected ? 'text-gray-900 dark:text-white font-extrabold' : 'text-gray-700 dark:text-gray-300'}>
                            {category}
                          </span>
                        </div>
                        <span className="text-gray-555 dark:text-gray-400 text-[10px] font-bold tabular-nums">
                          {count} ({percentage}%)
                        </span>
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
                          className={`h-full ${colors.bar} transition-all duration-500 ease-out rounded-full relative z-0`}
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
