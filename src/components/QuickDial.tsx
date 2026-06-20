'use client'

import { useState, useEffect } from 'react'
import { Phone, X, ChevronUp } from 'lucide-react'

const hotlines = [
  { label: 'CDRRMO Ligao City', number: '(052) 481-0012' },
  { label: 'Ligao City Fire Station', number: '(052) 481-0624' },
  { label: 'Ligao City PNP', number: '(052) 481-0035' },
  { label: 'Emergency / Rescue', number: '911' },
  { label: 'Red Cross Albay', number: '(052) 820-3232' },
]

export default function QuickDial() {
  const [open, setOpen] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-20 right-4 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
          open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-br from-red-700 to-red-900 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm tracking-wide">🚨 Emergency Hotlines</span>
          <button onClick={() => setOpen(false)} className="text-red-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="bg-gray-900 divide-y divide-gray-800">
          {hotlines.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors group"
            >
              <div>
                <p className="text-white text-xs font-semibold group-hover:text-red-400 transition-colors">
                  {h.label}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{h.number}</p>
              </div>
              <Phone size={14} className="text-red-400 group-hover:text-red-300 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* FAB Button */}
      <button
        id="quick-dial-btn"
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-sm
          hover:from-red-500 hover:to-red-600 active:scale-95 transition-all duration-200`}
        aria-label="Open emergency hotlines"
      >
        <Phone size={16} className={`transition-transform duration-300 ${open ? 'rotate-12' : ''}`} />
        <span>Quick Dial</span>
        <ChevronUp
          size={14}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </>
  )
}
