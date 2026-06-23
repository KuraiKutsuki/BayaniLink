'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Visible placeholder while JS loads — prevents invisible button on mobile and avoids theme flash
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
      className={`
        w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
        border touch-manipulation active:scale-95
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-yellow-400 md:hover:bg-gray-700 md:hover:border-gray-600'
          : 'bg-amber-50 border-amber-200 text-amber-600 md:hover:bg-amber-100'
        }
      `}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
