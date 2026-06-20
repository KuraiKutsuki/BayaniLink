'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
        border hover:scale-110 active:scale-95
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700 hover:border-gray-600'
          : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
        }
      `}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={16} className="transition-transform duration-300" />
      )}
    </button>
  )
}
