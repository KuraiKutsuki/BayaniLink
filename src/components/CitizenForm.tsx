'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { MapPin, Upload, AlertTriangle, CheckCircle, Loader2, X, Search, ChevronDown, Waves, Flame, Car, Zap, HeartPulse, CircleAlert, Send } from 'lucide-react'

const CATEGORIES = [
  { label: 'Flood',         icon: Waves,       color: 'from-blue-600 to-blue-800' },
  { label: 'Fire',          icon: Flame,       color: 'from-orange-600 to-red-700' },
  { label: 'Crash',         icon: Car,         color: 'from-yellow-600 to-orange-700' },
  { label: 'Dangling Wire', icon: Zap,         color: 'from-yellow-500 to-yellow-700' },
  { label: 'Medical',       icon: HeartPulse,  color: 'from-green-600 to-green-800' },
  { label: 'Other',         icon: CircleAlert, color: 'from-gray-600 to-gray-800' },
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
  imageFile: File | null
  imagePreview: string | null
}

type SubmitStatus = 'idle' | 'locating' | 'uploading' | 'submitting' | 'success' | 'error'

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
          rounded-xl shadow-xl overflow-hidden">
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
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
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

export default function CitizenForm() {
  const [form, setForm] = useState<FormState>({
    category: '',
    description: '',
    barangay: '',
    latitude: null,
    longitude: null,
    imageFile: null,
    imagePreview: null,
  })
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
        setStatus('idle')
      },
      () => {
        setErrorMsg('Unable to retrieve your location. Please allow location access.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be under 5MB.')
      return
    }
    setForm((f) => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }))
  }, [])

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
      return setErrorMsg('Please get your location first.')

    let image_url: string | null = null

    if (form.imageFile) {
      setStatus('uploading')
      const fileName = `${Date.now()}-${form.imageFile.name.replace(/\s/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(fileName, form.imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setErrorMsg(`Image upload failed: ${uploadError.message}`)
        setStatus('error')
        return
      }

      const { data: urlData } = supabase.storage.from('incident-photos').getPublicUrl(uploadData.path)
      image_url = urlData.publicUrl
    }

    setStatus('submitting')
    const { error: insertError } = await supabase.from('reports').insert({
      category: form.category,
      description: form.description,
      barangay: form.barangay,
      latitude: form.latitude,
      longitude: form.longitude,
      image_url,
    })

    if (insertError) {
      setErrorMsg(`Submission failed: ${insertError.message}`)
      setStatus('error')
      return
    }

    setStatus('success')
    setTimeout(() => {
      setForm({
        category: '',
        description: '',
        barangay: '',
        latitude: null,
        longitude: null,
        imageFile: null,
        imagePreview: null,
      })
      setStatus('idle')
    }, 3000)
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-400/50 dark:border-green-500/40 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report Submitted!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xs">
          Your emergency report has been sent to the Ligao City CDRRMO. Help is on the way.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">Resetting form…</p>
      </div>
    )
  }

  const isLoading = status === 'locating' || status === 'uploading' || status === 'submitting'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-500/40 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Category Selection — 3 cols on mobile, 6 cols on md+ */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors">
          Incident Type <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategorySelect(cat.label)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-xs font-semibold
                ${form.category === cat.label
                  ? `bg-gradient-to-b ${cat.color} border-white/30 text-white scale-105 shadow-lg`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200 shadow-sm dark:shadow-none'
                }`}
              id={`category-${cat.label.replace(/\s/g, '-').toLowerCase()}`}
            >
              <cat.icon size={26} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barangay + Description — 1 col on mobile, 2 cols on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
            Barangay <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <BarangaySelect
            value={form.barangay}
            onChange={(val) => setForm((f) => ({ ...f, barangay: val }))}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
            Description <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
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

      {/* Location + Photo — 1 col on mobile, 2 cols on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
            Your Location <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <button
            type="button"
            id="get-location-btn"
            onClick={handleGetLocation}
            disabled={status === 'locating'}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200
              ${form.latitude !== null
                ? 'border-green-400/60 dark:border-green-500/60 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:border-red-300 dark:hover:border-gray-500'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {status === 'locating' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            {status === 'locating'
              ? 'Locating…'
              : form.latitude !== null
              ? `${form.latitude.toFixed(5)}, ${form.longitude!.toFixed(5)}`
              : 'Get My Current Location'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
            Photo <span className="text-gray-400 dark:text-gray-500 font-normal">(optional, max 5MB)</span>
          </label>
          {form.imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1 hover:bg-red-900/80 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed
                border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800/30
                cursor-pointer hover:border-red-300 dark:hover:border-gray-500
                hover:bg-red-50/50 dark:hover:bg-gray-800/60 transition-all"
            >
              <Upload size={24} className="text-gray-400 dark:text-gray-500" />
              <span className="text-gray-500 dark:text-gray-500 text-sm">Tap to upload a photo</span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="submit-report-btn"
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold
          text-base tracking-wide shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-red-600
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
  )
}
