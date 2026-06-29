'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { submitReport, registerReportSms } from '@/app/actions/report'
import { MapPin, Upload, AlertTriangle, CheckCircle, Loader2, X, Search, ChevronDown, Waves, Flame, Car, Zap, HeartPulse, CircleAlert, Send, Maximize2, ArrowLeft, Camera, Image } from 'lucide-react'

// Leaflet map — SSR disabled (Leaflet requires browser APIs)
const ReportMap = dynamic(() => import('./ReportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full rounded-xl bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 flex flex-col items-center justify-center gap-2 animate-pulse transition-all">
      <Loader2 className="w-6 h-6 text-gray-400 dark:text-gray-500 animate-spin" />
      <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">Loading Interactive Map...</span>
    </div>
  ),
})

const CATEGORIES = [
  { label: 'Flood',         icon: Waves,       color: 'from-blue-600 to-blue-800',       glow: 'shadow-blue-500/50 dark:shadow-blue-500/30' },
  { label: 'Fire',          icon: Flame,       color: 'from-orange-600 to-red-700',      glow: 'shadow-red-500/50 dark:shadow-red-500/30' },
  { label: 'Crash',         icon: Car,         color: 'from-yellow-600 to-orange-700',   glow: 'shadow-yellow-500/50 dark:shadow-yellow-500/30' },
  { label: 'Dangling Wire', icon: Zap,         color: 'from-yellow-500 to-yellow-700',   glow: 'shadow-amber-500/50 dark:shadow-amber-500/30' },
  { label: 'Medical',       icon: HeartPulse,  color: 'from-green-600 to-green-800',     glow: 'shadow-green-500/50 dark:shadow-green-500/30' },
  { label: 'Other',         icon: CircleAlert, color: 'from-gray-600 to-gray-800',       glow: 'shadow-gray-500/50 dark:shadow-gray-500/30' },
]

const BARANGAYS = [
  'Abella', 'Allang', 'Amtic', 'Bacong', 'Bagumbayan', 'Balanac', 'Baligang',
  'Barayong', 'Basag', 'Batang', 'Bay', 'Binanowan', 'Binatagan', 'Bobonsuran',
  'Bonga', 'Busac', 'Busay', 'Cabarian', 'Calzada', 'Catburawan', 'Cavasi',
  'Culliat', 'Dunao', 'Francia', 'Guilid', 'Herrera', 'Layon', 'Macalidong',
  'Mahaba', 'Malama', 'Maonon', 'Nabonton', 'Nasisi', 'Oma-Oma', 'Palapas',
  'Pandan', 'Paulba', 'Paulog', 'Pinamaniquian', 'Pinit', 'Ranao-Ranao',
  'San Vicente', 'Santa Cruz', 'Tagpo', 'Tambo', 'Tandarora', 'Tastas',
  'Tinago', 'Tinampo', 'Tiongson', 'Tomolin', 'Tuburan',
  'Tula-Tula Grande', 'Tula-Tula Pequeño', 'Tupas',
]

interface FormState {
  category: string
  description: string
  barangay: string
  latitude: number | null
  longitude: number | null
  address: string | null
  imageFile: File | null
  imagePreview: string | null
}

type SubmitStatus = 'idle' | 'locating' | 'uploading' | 'submitting' | 'success' | 'error'

const MAX_DESC = 500

// ── Searchable Barangay Dropdown ─────────────────────────────────────────────
interface BarangaySelectProps {
  value: string
  onChange: (val: string) => void
}

function BarangaySelect({ value, onChange }: BarangaySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? BARANGAYS.filter((b) => b.toLowerCase().includes(query.toLowerCase()))
    : BARANGAYS

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const handleSelect = (barangay: string) => {
    onChange(barangay)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        id="barangay-select-btn"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between bg-white dark:bg-gray-800 border
          rounded-xl px-4 py-3 text-sm transition-colors text-left
          ${
            open
              ? 'border-red-500 ring-1 ring-red-500/50'
              : 'border-gray-300 dark:border-gray-700 hover:border-red-300 dark:hover:border-gray-500'
          }`}
      >
        <span className={value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}>
          {value || 'Select barangay…'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-xl shadow-xl overflow-hidden origin-top animate-dropdown-in">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search barangay…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  outline-none min-w-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto scrollbar-hide py-1">
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <li key={b}>
                  <button
                    type="button"
                    onClick={() => handleSelect(b)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors focus-visible:bg-red-50 dark:focus-visible:bg-red-950/30 focus-visible:text-red-700 dark:focus-visible:text-red-400 focus:outline-none
                      ${
                        b === value
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    {b}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                No barangay found for &ldquo;{query}&rdquo;
              </li>
            )}
          </ul>

          {/* Footer count */}
          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} of {BARANGAYS.length} barangays
          </div>
        </div>
      )}
    </div>
  )
}

function CitizenFormInner() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState<FormState>({
    category: searchParams.get('category') || '',
    description: searchParams.get('description') || '',
    barangay: searchParams.get('barangay') || '',
    latitude: null,
    longitude: null,
    address: null,
    imageFile: null,
    imagePreview: null,
  })

  // Auto-scroll to map if form is pre-filled from AI
  useEffect(() => {
    if (searchParams.get('category') && searchParams.get('description')) {
      setTimeout(() => {
        const el = document.getElementById('step-3')
        if (el) {
          const offset = 124
          const bodyRect = document.body.getBoundingClientRect().top
          const elementRect = el.getBoundingClientRect().top
          window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' })
        }
      }, 500)
    }
  }, [searchParams])
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [reportId, setReportId] = useState<string | null>(null)
  const [reportCategory, setReportCategory] = useState<string>('')
  const [countdown, setCountdown] = useState(8)
  // Increments each time GPS sets coords → tells the map to fly there
  const [gpsTrigger, setGpsTrigger] = useState(0)

  // Step Progress Tracking
  const [activeStep, setActiveStep] = useState(1)
  const isStep1Complete = !!form.category
  const isStep2Complete = !!form.barangay && form.description.trim().length > 0
  const isStep3Complete = form.latitude !== null && form.longitude !== null
  const isStep4Complete = isStep1Complete && isStep2Complete && isStep3Complete

  // Update active step based on viewport scroll position
  useEffect(() => {
    const handleScroll = () => {
      const step1 = document.getElementById('step-1')
      const step2 = document.getElementById('step-2')
      const step3 = document.getElementById('step-3')
      const step4 = document.getElementById('step-4')

      if (!step1 || !step2 || !step3 || !step4) return

      const scrollCenter = window.scrollY + window.innerHeight / 2

      if (scrollCenter >= step4.offsetTop) {
        setActiveStep(4)
      } else if (scrollCenter >= step3.offsetTop) {
        setActiveStep(3)
      } else if (scrollCenter >= step2.offsetTop) {
        setActiveStep(2)
      } else {
        setActiveStep(1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStepClick = (elementId: string) => {
    const el = document.getElementById(elementId)
    if (el) {
      // Clear the sticky header (64px) + sticky progress tracker (approx 58px)
      const offset = 124
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // ── Fullscreen map modal state ────────────────────────────────────────────
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const [tempLat, setTempLat] = useState<number | null>(null)
  const [tempLng, setTempLng] = useState<number | null>(null)
  const [tempGpsTrigger, setTempGpsTrigger] = useState(0)
  const [fullscreenGpsLoading, setFullscreenGpsLoading] = useState(false)

  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [tempAddress, setTempAddress] = useState<string | null>(null)
  const [isTempAddressLoading, setIsTempAddressLoading] = useState(false)

  // Reverse geocoding for inline map
  useEffect(() => {
    if (form.latitude === null || form.longitude === null) return
    let isMounted = true
    const fetchAddress = async () => {
      setIsAddressLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${form.latitude}&lon=${form.longitude}&zoom=18&addressdetails=1`)
        const data = await res.json()
        if (isMounted) {
          setForm(f => ({ ...f, address: data.display_name }))
          const details = data.address || {}
          const possibleBarangay = details.village || details.suburb || details.neighbourhood || details.quarter
          if (possibleBarangay) {
            const match = BARANGAYS.find(b => possibleBarangay.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(possibleBarangay.toLowerCase()))
            if (match) {
              setForm(f => ({ ...f, barangay: match }))
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch address:', e)
      } finally {
        if (isMounted) setIsAddressLoading(false)
      }
    }
    const timeoutId = setTimeout(fetchAddress, 300)
    return () => { isMounted = false; clearTimeout(timeoutId) }
  }, [form.latitude, form.longitude])

  // Reverse geocoding for fullscreen map
  useEffect(() => {
    if (tempLat === null || tempLng === null) return
    let isMounted = true
    const fetchAddress = async () => {
      setIsTempAddressLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempLat}&lon=${tempLng}&zoom=18&addressdetails=1`)
        const data = await res.json()
        if (isMounted) setTempAddress(data.display_name)
      } catch (e) {
        console.error('Failed to fetch temp address:', e)
      } finally {
        if (isMounted) setIsTempAddressLoading(false)
      }
    }
    const timeoutId = setTimeout(fetchAddress, 300)
    return () => { isMounted = false; clearTimeout(timeoutId) }
  }, [tempLat, tempLng])

  // Lock body scroll when fullscreen map is open
  useEffect(() => {
    document.body.style.overflow = mapFullscreen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mapFullscreen])

  // Close fullscreen on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mapFullscreen) setMapFullscreen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mapFullscreen])

  const handleCategorySelect = (cat: string) => {
    setForm((f) => ({ ...f, category: cat }))
    setErrorMsg('')
    if (status === 'error') setStatus('idle')
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }))
        setGpsTrigger((t) => t + 1) // signal map to fly to GPS coords
        setStatus('idle')
      },
      () => {
        setErrorMsg('Unable to retrieve your location. Please allow location access.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleMapLocationChange = (lat: number, lng: number) => {
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
    if (errorMsg) setErrorMsg('')
  }

  // ── Fullscreen map handlers ───────────────────────────────────────────────
  const openFullscreenMap = () => {
    setTempLat(form.latitude)
    setTempLng(form.longitude)
    setTempGpsTrigger(0)
    setMapFullscreen(true)
  }

  const confirmFullscreenLocation = () => {
    if (tempLat !== null && tempLng !== null) {
      setForm((f) => ({ ...f, latitude: tempLat, longitude: tempLng }))
      setGpsTrigger((t) => t + 1) // sync the inline map to confirmed coords
      if (errorMsg) setErrorMsg('')
    }
    setMapFullscreen(false)
  }

  const handleFullscreenGPS = () => {
    if (!navigator.geolocation) return
    setFullscreenGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTempLat(pos.coords.latitude)
        setTempLng(pos.coords.longitude)
        setTempGpsTrigger((t) => t + 1)
        setFullscreenGpsLoading(false)
      },
      () => { setFullscreenGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback((file: File) => {
    setErrorMsg('')
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be under 5MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file.')
      return
    }
    setForm((f) => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }))
  }, [])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const clearImage = () => {
    setForm((f) => ({ ...f, imageFile: null, imagePreview: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!form.category) return setErrorMsg('Please select an incident category.')
    if (!form.description.trim()) return setErrorMsg('Please provide a description.')
    if (!form.barangay) return setErrorMsg('Please select a barangay.')
    if (form.latitude === null || form.longitude === null)
      return setErrorMsg('Please tap the map or use GPS to set your location.')

    setStatus('submitting')
    
    // Prepare FormData for the Server Action
    const formData = new FormData()
    formData.append('category', form.category)
    formData.append('description', form.description)
    formData.append('barangay', form.barangay)
    formData.append('latitude', form.latitude.toString())
    formData.append('longitude', form.longitude.toString())
    if (form.imageFile) {
      formData.append('imageFile', form.imageFile)
    }

    const result = await submitReport(formData)

    if (!result.success) {
      setErrorMsg(result.error || 'An error occurred during submission.')
      setStatus('error')
      return
    }

    setReportId(result.reportId ?? null)
    setReportCategory(form.category)
    setCountdown(8)
    setStatus('success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (status === 'success') {
    const cat = CATEGORIES.find((c) => c.label === reportCategory)
    const CatIcon = cat?.icon
    const statusUrl = typeof window !== 'undefined' ? `${window.location.origin}/status/${reportId}` : ''

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col items-center gap-6 max-w-xl mx-auto text-center animate-modal-in">
        {/* Animated check */}
        <div className="relative flex items-center justify-center py-1">
          {/* Pulsing outer ring */}
          <div className="absolute w-20 h-20 rounded-full bg-green-500/10 dark:bg-green-400/10 animate-ping-slow" />
          
          {/* Main check circle */}
          <div className="relative w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-400/50 flex items-center justify-center shadow-inner">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Report Dispatched!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 leading-relaxed">
            Your emergency report has been transmitted to the <span className="font-extrabold text-gray-700 dark:text-gray-200">Ligao City CDRRMO</span>. Help is on the way.
          </p>
        </div>

        {/* Action: Link to Status Portal */}
        <div className="w-full flex flex-col items-center gap-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="text-center w-full">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest block mb-1">
              Active Tracking Details
            </span>
            <p className="font-mono text-base font-bold text-gray-850 dark:text-gray-100 tracking-wider">
              #{reportId?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* QR Code */}
          {reportId && (
            <div className="flex flex-col items-center gap-2 mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(statusUrl)}`}
                alt="Scan to track status on mobile"
                width={130}
                height={130}
                className="border border-gray-200 dark:border-gray-850 rounded-xl p-2 bg-white select-none shrink-0"
              />
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">Scan to track on another device</span>
            </div>
          )}

          {/* Link Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <a
              href={`/status/${reportId}`}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <MapPin size={14} />
              <span>Track Real-Time Status</span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(statusUrl)
                alert('Tracking link copied to clipboard!')
              }}
              className="flex items-center justify-center gap-2 border border-gray-205 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-95 cursor-pointer"
            >
              <span>Copy Link</span>
            </button>
          </div>
        </div>

        {/* Optional post-submission SMS signup */}
        <SmsOptInCard reportId={reportId || ''} />

        {/* 911 reminder */}
        <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3 text-center">
          <p className="text-[11px] text-red-700 dark:text-red-400 leading-normal">
            If this is life-threatening, call{' '}
            <a href="tel:911" className="font-extrabold text-red-600 dark:text-red-400 underline">911</a>{' '}
            immediately — don't wait for a response.
          </p>
        </div>

        {/* Submit another report button */}
        <button
          onClick={() => {
            setForm({
              category: '',
              description: '',
              barangay: '',
              latitude: null,
              longitude: null,
              address: null,
              imageFile: null,
              imagePreview: null,
            })
            setReportId(null)
            setReportCategory('')
            setStatus('idle')
          }}
          className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors underline cursor-pointer"
        >
          Submit Another Emergency Report
        </button>
      </div>
    )
  }

  const isLoading = status === 'locating' || status === 'uploading' || status === 'submitting'

  return (
    <>
      {/* Sticky Step Progress Tracker */}
      <div 
        id="step-progress-tracker"
        className="sticky top-[60px] z-40 -mx-4 px-4 py-2.5 md:mx-0 md:px-6 bg-white dark:bg-gray-950 border-b border-gray-200/60 dark:border-gray-800/40 mb-6 transition-all duration-300"
      >
        <div className="flex items-center justify-between w-full max-w-xl mx-auto relative">
          
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-800 z-0" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-red-500 to-green-500 z-0 transition-all duration-500 ease-out" 
            style={{ 
              width: `${
                isStep3Complete ? 'calc(100% - 32px)' :
                isStep2Complete ? '66%' :
                isStep1Complete ? '33%' : '0%'
              }` 
            }} 
          />

          {[
            { id: 1, label: 'Type', icon: AlertTriangle, elementId: 'step-1', complete: isStep1Complete },
            { id: 2, label: 'Details', icon: Search, elementId: 'step-2', complete: isStep2Complete },
            { id: 3, label: 'Map Pin', icon: MapPin, elementId: 'step-3', complete: isStep3Complete },
            { id: 4, label: 'Submit', icon: Send, elementId: 'step-4', complete: isStep4Complete },
          ].map((step) => {
            const StepIcon = step.icon
            const isActive = activeStep === step.id
            const isCompleted = step.complete

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.elementId)}
                className="flex flex-col items-center gap-1 z-10 focus:outline-none group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20' 
                    : isActive
                      ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30 scale-110 ring-4 ring-red-500/20'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 group-hover:border-red-400 dark:group-hover:border-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={16} className="stroke-[3]" />
                  ) : (
                    <StepIcon size={14} className={isActive ? 'animate-pulse' : ''} />
                  )}
                  
                  {/* Subtle active outer glow */}
                  {isActive && !isCompleted && (
                    <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-30" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-200
                  ${isActive
                    ? 'text-red-600 dark:text-red-400 font-bold'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-500/40 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* ── Step 1: Incident Type ─────────────────────────── */}
      <div id="step-1" className="relative z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
            Incident Type <span className="text-red-500 dark:text-red-400">*</span>
          </label>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategorySelect(cat.label)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-xs font-semibold active:scale-95
                ${form.category === cat.label
                  ? `bg-gradient-to-b ${cat.color} border-white/30 text-white scale-105 hover:scale-[1.07] shadow-lg ${cat.glow}`
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:scale-[1.03] hover:border-red-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200 shadow-sm dark:shadow-none'
                }`}
              id={`category-${cat.label.replace(/\s/g, '-').toLowerCase()}`}
            >
              <cat.icon size={26} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 2: Location Details ──────────────────────── */}
      <div id="step-2" className="relative z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location Details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Barangay <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <BarangaySelect
              value={form.barangay}
              onChange={(val) => setForm((f) => ({ ...f, barangay: val }))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Description <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <span className={`text-xs font-medium tabular-nums ${
                form.description.length > MAX_DESC * 0.9
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {form.description.length}/{MAX_DESC}
              </span>
            </div>
            <textarea
              id="description"
              rows={4}
              maxLength={MAX_DESC}
              placeholder="Briefly describe the emergency situation…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 resize-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Step 3: Location & Map ──────────────────────── */}
      <div id="step-3" className="relative z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Your Location <span className="text-red-500 dark:text-red-400">*</span>
            </label>
          </div>
          {/* Right side: GPS chip + Full Map button */}
          <div className="flex items-center gap-2">
            {/* GPS quick-detect button */}
            <button
              type="button"
              id="get-location-btn"
              onClick={handleGetLocation}
              disabled={status === 'locating'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200
                ${form.latitude !== null
                  ? 'border-green-400/60 dark:border-green-500/60 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-red-400 dark:hover:border-gray-500'
                } ${status === 'locating' ? 'animate-gps-pulse' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {status === 'locating' ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <MapPin size={13} />
              )}
              {status === 'locating'
                ? 'Locating…'
                : form.latitude !== null
                ? '✓ GPS Located'
                : 'Use GPS'}
            </button>
            {/* Full-screen map button */}
            <button
              type="button"
              id="fullscreen-map-btn"
              onClick={openFullscreenMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-red-400 dark:hover:border-gray-500 text-xs font-semibold transition-all duration-200"
            >
              <Maximize2 size={13} />
              Full Map
            </button>
          </div>
        </div>

        {/* Leaflet map */}
        <ReportMap
          latitude={form.latitude}
          longitude={form.longitude}
          gpsTrigger={gpsTrigger}
          onLocationChange={handleMapLocationChange}
        />

        {/* Coordinate badge shown below map when location is set */}
        {form.latitude !== null && (
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                {isAddressLoading ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Locating address...
                  </span>
                ) : form.address ? (
                  <span className="text-xs text-green-700 dark:text-green-400 font-medium leading-tight line-clamp-2">
                    {form.address}
                  </span>
                ) : (
                  <span className="text-xs text-green-700 dark:text-green-400 font-mono">
                    {form.latitude.toFixed(6)}, {form.longitude!.toFixed(6)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-6">— drag pin to adjust location</span>
          </div>
        )}
      </div>

      {/* ── Step 4: Photo ──────────────────────────────── */}
      <div id="step-4" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Photo <span className="text-gray-400 dark:text-gray-500 font-normal">(optional, max 5MB)</span>
          </label>
        </div>
        {form.imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            
            {/* File info overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 flex items-center justify-between text-white">
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-xs font-bold truncate">{form.imageFile?.name}</p>
                <p className="text-[10px] text-gray-300 font-mono mt-0.5">
                  {(form.imageFile ? (form.imageFile.size / (1024 * 1024)).toFixed(2) : 0)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1"
              >
                <X size={12} className="stroke-[3]" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => {
              // On desktop, clicking anywhere inside the dropzone triggers file browse
              if (window.innerWidth >= 768) {
                const target = e.target as HTMLElement;
                if (!target.closest('button') && !target.closest('label') && !target.closest('input')) {
                  document.getElementById('photo-upload')?.click();
                }
              }
            }}
            className={`flex flex-col items-center justify-center gap-3 py-8 rounded-xl border-2 border-dashed transition-all duration-200 group
              ${isDragging
                ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20 scale-[1.01] shadow-lg shadow-red-500/10'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50/10 dark:hover:bg-red-950/10'
              } md:cursor-pointer`}
          >
            <Upload 
              size={24} 
              className={`text-gray-400 dark:text-gray-500 transition-all duration-300
                ${isDragging ? 'scale-125 text-red-500 -translate-y-1 animate-pulse' : 'group-hover:scale-110 group-hover:text-red-500'}`} 
            />
            <div className="text-center px-4">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold block">
                {/* Responsive text instructions */}
                <span className="hidden md:inline">
                  Drag & drop your emergency photo here, or <span className="text-red-600 dark:text-red-400 underline decoration-2 cursor-pointer hover:text-red-700">browse files</span>
                </span>
                <span className="md:hidden">Provide a photo of the emergency</span>
              </span>
              <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Supports PNG, JPG, or WEBP up to 5MB
              </span>
            </div>
            
            {/* Mobile/Tablet view: Dual Buttons */}
            <div className="flex flex-row gap-3 md:hidden">
              <label
                htmlFor="photo-capture"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Camera size={18} />
                Take Photo
              </label>
              <label
                htmlFor="photo-upload"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Image size={18} />
                Upload File
              </label>
            </div>

            <input
              id="photo-capture"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="submit-report-btn"
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-red-600 text-white font-bold
          text-base tracking-wide shadow-md shadow-red-900/10 hover:bg-red-700 active:bg-red-800
          active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
          flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {status === 'uploading' ? 'Uploading photo…' : status === 'submitting' ? 'Submitting…' : 'Processing…'}
          </>
        ) : (
          <><Send size={18} />Submit Emergency Report</>
        )}
      </button>
      </form>

      {/* Full-screen Map Modal */}
      {mapFullscreen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-gray-950 animate-modal-in">

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
            <button
              type="button"
              onClick={() => setMapFullscreen(false)}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>

            <p className="text-sm font-bold text-gray-800 dark:text-white">Pin Your Location</p>

            <button
              type="button"
              onClick={confirmFullscreenLocation}
              disabled={tempLat === null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
            >
              Confirm
            </button>
          </div>

          {/* GPS strip */}
          <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
            <button
              type="button"
              onClick={handleFullscreenGPS}
              disabled={fullscreenGpsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-red-400 dark:hover:border-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {fullscreenGpsLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <MapPin size={15} className="text-red-500" />
              )}
              {fullscreenGpsLoading ? 'Getting your location…' : 'Use My GPS Location'}
            </button>
          </div>

          {/* Full-height map */}
          <div className="flex-1 relative overflow-hidden">
            <ReportMap
              latitude={tempLat}
              longitude={tempLng}
              gpsTrigger={tempGpsTrigger}
              onLocationChange={(lat, lng) => { setTempLat(lat); setTempLng(lng) }}
              fullHeight
            />
          </div>

          {/* Bottom coordinate bar */}
          <div className={`px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0 transition-all duration-300 ${
            tempLat !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  {isTempAddressLoading ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> Locating address...
                    </span>
                  ) : tempAddress ? (
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium leading-tight line-clamp-2">
                      {tempAddress}
                    </span>
                  ) : (
                    <span className="text-xs text-green-700 dark:text-green-400 font-mono">
                      {tempLat?.toFixed(6)}, {tempLng?.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-6">— drag pin to adjust location</span>
            </div>
          </div>

        </div>
      )}
    </>
  )
}

export default function CitizenForm() {
  return (
    <Suspense fallback={
      <div className="flex w-full items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    }>
      <CitizenFormInner />
    </Suspense>
  )
}

// ── SMS Subscription Opt-in Card ───────────────────────────────────────────
function SmsOptInCard({ reportId }: { reportId: string }) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [smsStatus, setSmsStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [smsError, setSmsError] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSmsError(null)
    setSmsStatus('submitting')

    try {
      const result = await registerReportSms(reportId, phoneNumber)
      if (!result.success) {
        setSmsError(result.error || 'Failed to subscribe.')
        setSmsStatus('error')
        return
      }
      setSmsStatus('success')
    } catch (err) {
      setSmsError('An unexpected connection error occurred.')
      setSmsStatus('error')
    }
  }

  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 7) return phone
    const firstPart = phone.slice(0, 4)
    const lastPart = phone.slice(-3)
    return `${firstPart}••••${lastPart}`
  }

  if (smsStatus === 'success') {
    return (
      <div className="w-full bg-green-50/50 dark:bg-green-950/15 border border-green-200/50 dark:border-green-900/30 rounded-2xl p-5 flex flex-col items-center gap-2">
        <CheckCircle className="text-green-600 dark:text-green-500" size={24} />
        <span className="text-xs font-extrabold text-green-800 dark:text-green-400">SMS Alerts Activated</span>
        <p className="text-[10px] text-green-700 dark:text-green-500 leading-normal">
          We will text you at <span className="font-bold">{maskPhoneNumber(phoneNumber)}</span> when status transitions to In Progress or Resolved.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-left">
      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">
        SMS Tracking Opt-In
      </span>
      <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-2 leading-snug">
        Receive updates directly on your phone
      </h3>
      
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="tel"
            placeholder="09XXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={smsStatus === 'submitting'}
            className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={smsStatus === 'submitting' || !phoneNumber}
          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer"
        >
          {smsStatus === 'submitting' ? '...' : 'Subscribe'}
        </button>
      </form>
      
      {smsError && (
        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mt-2">
          {smsError}
        </p>
      )}
    </div>
  )
}
