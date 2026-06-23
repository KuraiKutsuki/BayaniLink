'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ShieldAlert, FileText, Home } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/report', label: 'Report Emergency', icon: ShieldAlert },
  { href: '/guidelines', label: 'Guidelines', icon: FileText },
  { href: '/hotlines', label: 'Hotlines', icon: Phone },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent scroll and hide floating buttons when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('menu-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
  }, [open])

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/BayaniLink.png" 
                alt="BayaniLink Logo" 
                width={36} 
                height={36} 
                priority 
                style={{ width: '36px', height: '36px' }} 
              />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold text-base leading-none transition-colors duration-300">
                BayaniLink
              </h1>
              <p className="text-gray-500 dark:text-gray-500 text-[10px] mt-0.5 font-medium tracking-wide">
                LIGAO CITY EMERGENCY SYSTEM
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-all duration-200 relative py-1 group
                    ${isActive
                      ? 'text-red-600 dark:text-red-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-300'
                    }`}
                >
                  {link.label}
                  <span 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400 rounded-full transform origin-left transition-all duration-300
                      ${isActive 
                        ? 'scale-x-100 opacity-100' 
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                      }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Actions & Hamburger Toggle */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-400/50 dark:border-green-500/30 text-green-700 dark:text-green-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
              CDRRMO Live
            </div>
            
            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setOpen(!open)}
              type="button"
              className="p-1.5 md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors active:scale-95 w-9 h-9 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ${
                    open ? 'rotate-45' : '-translate-y-1.5'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ${
                    open ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ${
                    open ? '-rotate-45' : 'translate-y-1.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-[62px] right-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl p-5 md:hidden flex flex-col justify-between transition-transform duration-300 ease-out origin-right ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Quick Navigation
          </p>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const LinkIcon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-98
                    ${isActive
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/55 dark:border-red-500/20 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                >
                  <LinkIcon size={18} className={isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400'} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile menu footer */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-500/10 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              CDRRMO Operators Online
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
            City of Ligao &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}
