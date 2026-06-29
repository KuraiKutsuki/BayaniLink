'use client'

import { useState, useEffect, useTransition } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/database.types'
import { updateReportStatus } from '@/app/admin/actions'
import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  X, 
  Search, 
  Filter,
  Map as MapIcon,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react'
import dynamic from 'next/dynamic'
import AnalyticsCharts from './AnalyticsCharts'

const ReportMap = dynamic(() => import('./ReportMap'), { ssr: false })

type ReportRow = Database['public']['Tables']['reports']['Row']

// Predefined categories
const CATEGORIES = ['Flood', 'Fire', 'Crash', 'Dangling Wire', 'Medical', 'Other']

export default function AdminDashboard({ initialReports }: { initialReports: ReportRow[] }) {
  const [reports, setReports] = useState<ReportRow[]>(initialReports)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [isPending, startTransition] = useTransition()
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReports((current) => [payload.new as ReportRow, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setReports((current) =>
              current.map((r) => (r.id === payload.new.id ? (payload.new as ReportRow) : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReports((current) => current.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter logic
  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter
    
    const searchString = `${report.barangay} ${report.description} ${report.category}`.toLowerCase()
    const matchesSearch = searchString.includes(searchTerm.toLowerCase())

    return matchesStatus && matchesCategory && matchesSearch
  })

  const selectedReport = reports.find((r) => r.id === selectedReportId)
  const selectedIndex = filteredReports.findIndex((r) => r.id === selectedReportId)

  // Handle status update
  const handleStatusChange = (reportId: string, newStatus: 'Submitted' | 'In Progress' | 'Resolved') => {
    setUpdateError(null)
    startTransition(async () => {
      try {
        const result = await updateReportStatus(reportId, newStatus)
        if (!result.success) {
          throw new Error('Update failed')
        }
      } catch (err: any) {
        setUpdateError(err.message || 'Failed to update report status')
      }
    })
  }

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

  // Helper to determine status badge classes
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
      case 'In Progress':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30'
      case 'Resolved':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 1. Analytics at top */}
      <AnalyticsCharts reports={filteredReports} />

      {/* 2. Responsive view controls (< lg viewport) */}
      <div className="flex lg:hidden bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 self-center w-full max-w-sm border border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ListIcon size={14} />
          Reports List ({filteredReports.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'map'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <MapIcon size={14} />
          Live Map
        </button>
      </div>

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[calc(100vh-320px)] min-h-[480px]">
        {/* Reports Panel (Left) */}
        <div 
          className={`lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden ${
            activeTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search barangay, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-300 focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/80">
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mb-3">
                  <Filter size={20} />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  No matching reports found
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = report.id === selectedReportId
                return (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedReportId(report.id)
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-start justify-between gap-3 transition-all ${
                      isSelected 
                        ? 'bg-red-50/60 dark:bg-red-955/15' 
                        : ''
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black uppercase tracking-wider transition-colors ${
                          isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {report.category}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          Brgy. {report.barangay}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pr-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold pt-1">
                        <Calendar size={12} className="shrink-0" />
                        <span>{formatDate(report.created_at)}</span>
                        {report.image_url && (
                          <>
                            <span>•</span>
                            <ImageIcon size={11} className="inline shrink-0" />
                            <span>Photo</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Map Panel (Right) */}
        <div 
          className={`lg:col-span-7 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col h-full ${
            activeTab === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ReportMap
            readOnly
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => setSelectedReportId(id)}
            fullHeight
          />
        </div>
      </div>

      {/* 4. Side Drawer Detail Panel for Selected Report */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-[1050] animate-fade-in">
          {/* Modal overlay background click closer */}
          <div className="absolute inset-0" onClick={() => setSelectedReportId(null)} />
          
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col relative z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                  Emergency Incident Details
                </span>
                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  {selectedReport.category}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Prev/Next Navigation Controls */}
                {filteredReports.length > 1 && selectedIndex !== -1 && (
                  <div className="flex items-center bg-gray-150 dark:bg-gray-850 rounded-xl p-0.5 border border-gray-200/50 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedReportId(filteredReports[selectedIndex - 1].id)}
                      disabled={selectedIndex === 0}
                      title="Previous Incident"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="w-px h-5 bg-gray-250 dark:bg-gray-750 self-center" />
                    <button
                      onClick={() => setSelectedReportId(filteredReports[selectedIndex + 1].id)}
                      disabled={selectedIndex === filteredReports.length - 1}
                      title="Next Incident"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSelectedReportId(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/50 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {updateError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 text-xs font-semibold text-red-700 dark:text-red-400 animate-pulse">
                  {updateError}
                </div>
              )}

              {/* Status Update Sector */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Update Status
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedReport.status}
                    disabled={isPending}
                    onChange={(e) => handleStatusChange(selectedReport.id, e.target.value as any)}
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                  >
                    <option value="Submitted">Submitted (Pending)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  {isPending && (
                    <div className="animate-spin text-red-600 dark:text-red-500">
                      <Clock size={16} />
                    </div>
                  )}
                </div>
              </div>

              {/* Barangay & Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Location / Barangay
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-red-600 dark:text-red-500" />
                    <span>Barangay {selectedReport.barangay}, Ligao City</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Reported At
                  </h3>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(selectedReport.created_at)}
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Incident Description
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Incident Coordinates / Map link */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Spatial Coordinates
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Lat: {selectedReport.latitude.toFixed(6)}, Lng: {selectedReport.longitude.toFixed(6)}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-black hover:underline"
                  >
                    <span>Get Directions</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Photo Upload View */}
              {selectedReport.image_url && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Evidence Photo
                  </h3>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedReport.image_url}
                      alt={`${selectedReport.category} incident`}
                      className="object-contain w-full h-full max-h-[300px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
