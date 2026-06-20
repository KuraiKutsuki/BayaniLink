'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { MapPin, Upload, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react'

const CATEGORIES = [
  { label: 'Flood', emoji: '🌊', color: 'from-blue-600 to-blue-800' },
  { label: 'Fire', emoji: '🔥', color: 'from-orange-600 to-red-700' },
  { label: 'Crash', emoji: '💥', color: 'from-yellow-600 to-orange-700' },
  { label: 'Dangling Wire', emoji: '⚡', color: 'from-yellow-500 to-yellow-700' },
  { label: 'Medical', emoji: '🏥', color: 'from-green-600 to-green-800' },
  { label: 'Other', emoji: '⚠️', color: 'from-gray-600 to-gray-800' },
]

const BARANGAYS = [
  'Allang', 'Amtic', 'Bago', 'Baligang', 'Barayong', 'Basag', 'Batobalani',
  'Bigaa', 'Binanowan', 'Bubulusan', 'Calzada', 'Cocok-Cabitan', 'Coliat',
  'Dunao', 'Estancia', 'Gumabao', 'Hilot', 'Holugan', 'Imalnod', 'Iraya',
  'Labao', 'Laniton', 'Lao', 'Layon', 'Libod', 'Ligao City Proper', 'Luyuang',
  'Macalidong', 'Mahaba', 'Nabonton', 'Nagas', 'Oas', 'Paulba', 'Paulog',
  'Pinamaniquian', 'Ponso', 'Pulang Lupa', 'Salvacion', 'San Antonio',
  'San Francisco', 'San Marcos', 'San Miguel', 'San Vicente', 'Santa Cruz',
  'Tagpo', 'Talaohukan', 'Talongog', 'Tiwi', 'Tula-tula', 'Tupas', 'Ulango', 'Virac',
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

    // Upload image if provided
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

    // Submit report
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
    // Reset form after a short delay
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
        <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-500/40 flex items-center justify-center animate-bounce-once">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Report Submitted!</h2>
        <p className="text-gray-400 max-w-xs">
          Your emergency report has been sent to the Ligao City CDRRMO. Help is on the way.
        </p>
        <p className="text-xs text-gray-600">Resetting form…</p>
      </div>
    )
  }

  const isLoading = status === 'locating' || status === 'uploading' || status === 'submitting'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Error banner */}
      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Incident Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategorySelect(cat.label)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-xs font-semibold
                ${form.category === cat.label
                  ? `bg-gradient-to-b ${cat.color} border-white/30 text-white scale-105 shadow-lg`
                  : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
              id={`category-${cat.label.replace(/\s/g, '-').toLowerCase()}`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barangay Select */}
      <div>
        <label htmlFor="barangay" className="block text-sm font-semibold text-gray-300 mb-2">
          Barangay <span className="text-red-400">*</span>
        </label>
        <select
          id="barangay"
          value={form.barangay}
          onChange={(e) => setForm((f) => ({ ...f, barangay: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
            focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
        >
          <option value="">Select barangay…</option>
          {BARANGAYS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Briefly describe the emergency situation…"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
            placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1
            focus:ring-red-500/50 resize-none transition-colors"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Your Location <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          id="get-location-btn"
          onClick={handleGetLocation}
          disabled={status === 'locating'}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200
            ${form.latitude !== null
              ? 'border-green-500/60 bg-green-900/20 text-green-400'
              : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500'
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
            ? `📍 ${form.latitude.toFixed(5)}, ${form.longitude!.toFixed(5)}`
            : 'Get My Current Location'}
        </button>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Photo <span className="text-gray-500 font-normal">(optional, max 5MB)</span>
        </label>
        {form.imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-700">
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
              border-gray-700 bg-gray-800/30 cursor-pointer hover:border-gray-500 hover:bg-gray-800/60 transition-all"
          >
            <Upload size={24} className="text-gray-500" />
            <span className="text-gray-500 text-sm">Tap to upload a photo</span>
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
          '🚨 Submit Emergency Report'
        )}
      </button>
    </form>
  )
}
