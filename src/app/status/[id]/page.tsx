'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/database.types'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Clock, AlertCircle, CheckCircle2, ArrowLeft, Waves, Flame, Car, Zap, HeartPulse, CircleAlert, Loader2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

type ReportRow = Database['public']['Tables']['reports']['Row']

// Dynamic import for Leaflet map component (SSR disabled)
const ReportMap = dynamic(() => import('@/components/ReportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full rounded-2xl bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 flex flex-col items-center justify-center gap-2 animate-pulse">
      <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
      <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">Loading Map...</span>
    </div>
  ),
})

const CATEGORY_ICONS: Record<string, any> = {
  Flood: Waves,
  Fire: Flame,
  Crash: Car,
  'Dangling Wire': Zap,
  Medical: HeartPulse,
  Other: CircleAlert,
}

const CATEGORY_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  Flood: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/30' },
  Fire: { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-900/30' },
  Crash: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/30' },
  'Dangling Wire': { bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-900/30' },
  Medical: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-900/30' },
  Other: { bg: 'bg-gray-50 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700/60' },
}

interface StatusPageProps {
  params: Promise<{ id: string }>
}

export default function StatusPage({ params }: StatusPageProps) {
  const { id } = use(params)
  const [report, setReport] = useState<ReportRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    if (!id) return

    // Fetch initial report
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          setNotFoundState(true)
        } else {
          setReport(data)
        }
      } catch (err) {
        setNotFoundState(true)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()

    // Real-time subscription for this single report
    const channel = supabase
      .channel(`report-live-status-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports', filter: `id=eq.${id}` },
        (payload) => {
          setReport(payload.new as ReportRow)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center gap-4 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-red-600 dark:text-red-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading tracking portal...</span>
      </div>
    )
  }

  if (notFoundState || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center gap-6 p-4 text-center transition-colors duration-300">
        <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-500 animate-pulse" />
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-wider">Report Not Found</h1>
          <p className="text-xs text-gray-555 dark:text-gray-400 max-w-sm">
            We couldn't locate an emergency report matching that reference ID. Please check the URL or reference number.
          </p>
        </div>
        <Link 
          href="/report"
          className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Go Back to Reporting
        </Link>
      </div>
    )
  }

  // Determine current active step
  const STATUS_STEPS = [
    { 
      name: 'Submitted', 
      label: 'Report Submitted', 
      desc: 'Transmitted to Ligao City CDRRMO. Waiting for dispatcher review.',
      color: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/20 dark:ring-red-500/30',
      bg: 'bg-red-50 dark:bg-red-955/15',
      border: 'border-red-200 dark:border-red-900/30',
      icon: Clock 
    },
    { 
      name: 'In Progress', 
      label: 'Dispatching & Response', 
      desc: 'CDRRMO has processed the report. Emergency responders are being coordinated.',
      color: 'text-orange-600 dark:text-orange-400',
      ring: 'ring-orange-500/20 dark:ring-orange-500/30',
      bg: 'bg-orange-50 dark:bg-orange-955/15',
      border: 'border-orange-200 dark:border-orange-900/30',
      icon: AlertCircle 
    },
    { 
      name: 'Resolved', 
      label: 'Incident Resolved', 
      desc: 'Emergency cleared by response teams. Situation is resolved.',
      color: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-500/20 dark:ring-green-500/30',
      bg: 'bg-green-50 dark:bg-green-955/15',
      border: 'border-green-200 dark:border-green-900/30',
      icon: CheckCircle2 
    }
  ]

  const currentStatusIndex = report.status === 'Submitted' ? 0 : report.status === 'In Progress' ? 1 : 2
  const catTheme = CATEGORY_THEMES[report.category] || CATEGORY_THEMES.Other
  const CatIcon = CATEGORY_ICONS[report.category] || CircleAlert

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      {/* Header Banner */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800/60 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between w-full">
          <Link href="/report" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Back to Report</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-gray-800" />
            <span className="hidden sm:inline text-[9px] font-black text-gray-400 uppercase tracking-widest">
              LIGAO CITY CDRRMO PORTAL
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title Section */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 uppercase tracking-wider font-mono">
              Reference #{report.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">{formatDate(report.created_at)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider mt-2">
            Incident Tracking Status
          </h1>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Stepper Timeline Panel (Left / Top) */}
          <div className="md:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
              Timeline Progress
            </h3>

            <div className="relative pl-8 space-y-8">
              {/* Stepper vertical timeline bar */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />

              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentStatusIndex
                const isActive = index === currentStatusIndex
                const isPending = index > currentStatusIndex
                const StepIcon = step.icon

                return (
                  <div key={step.name} className="relative flex flex-col gap-1 transition-all">
                    {/* Circle badge */}
                    <div 
                      className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-gray-100 dark:bg-gray-850 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400' 
                          : isActive 
                            ? `${step.bg} ${step.border} ${step.color} ring-4 ${step.ring}` 
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <StepIcon size={14} className={isActive ? 'animate-pulse' : ''} />
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        isActive 
                          ? step.color 
                          : isCompleted 
                            ? 'text-gray-800 dark:text-gray-200 font-bold' 
                            : 'text-gray-400 dark:text-gray-655'
                      }`}>
                        {step.label}
                      </span>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${
                        isActive 
                          ? 'text-gray-900 dark:text-gray-300 font-medium' 
                          : 'text-gray-450 dark:text-gray-500'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Details & Map Panel (Right / Bottom) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Incident Details Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Incident Details
              </h3>

              {/* Category */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${catTheme.bg} ${catTheme.border}`}>
                  <CatIcon size={18} className={catTheme.text} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-505 uppercase tracking-wider block">Incident Type</span>
                  <span className="text-sm font-extrabold text-gray-950 dark:text-white uppercase">{report.category}</span>
                </div>
              </div>

              {/* Barangay Location */}
              <div>
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-505 uppercase tracking-wider block mb-0.5">Location</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                  <MapPin size={13} className="text-red-655 dark:text-red-500" />
                  <span>Barangay {report.barangay}, Ligao City</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-505 uppercase tracking-wider block mb-1">Description</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800 whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {/* Photo Evidence */}
              {report.image_url && (
                <div>
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-wider block mb-1.5">Photo Evidence</span>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.image_url}
                      alt="Incident evidence photo"
                      className="object-contain w-full h-full max-h-[180px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Read-only map visualization */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[260px]">
              <ReportMap
                readOnly
                reports={[report]}
                selectedReportId={report.id}
                fullHeight
              />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-wide uppercase border-t border-gray-200/50 dark:border-gray-850 shrink-0">
        © {new Date().getFullYear()} BayaniLink • CDRRMO Ligao City
      </footer>
    </div>
  )
}
