'use client'

import Image from 'next/image'
import { MapPin, Phone } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800/50 bg-gray-100 dark:bg-gray-900 mt-12 transition-colors duration-300">
      <div className="max-w-screen-lg mx-auto px-4 py-8 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/BayaniLink.png" alt="BayaniLink" width={28} height={28} style={{ width: '28px', height: '28px' }} />
              <span className="font-bold text-gray-900 dark:text-white text-sm">BayaniLink</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              Ligao City Emergency Reporting System — connecting citizens directly to the CDRRMO response team.
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <MapPin size={11} className="text-red-500 dark:text-red-400" />
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Ligao City, Albay, Philippines</span>
            </div>
          </div>

          {/* Hotlines column */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone size={11} />
              Emergency Hotlines
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'CDRRMO Ligao City', number: '(052) 481-0012' },
                { label: 'Fire Station', number: '(052) 481-0624' },
                { label: 'PNP Ligao City', number: '(052) 481-0035' },
                { label: 'Red Cross Albay', number: '(052) 820-3232' },
                { label: 'Emergency / Rescue', number: '911' },
              ].map((h) => (
                <li key={h.number} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{h.label}</span>
                  <a
                    href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                  >
                    {h.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About column */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              About
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              An initiative of the City Government of Ligao, Albay. This system is monitored by the City Disaster Risk Reduction and Management Office (CDRRMO) to ensure a fast and coordinated emergency response.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 italic">
              For life-threatening emergencies, always call{' '}
              <a href="tel:911" className="text-red-600 dark:text-red-400 font-bold not-italic hover:underline">911</a>{' '}
              immediately.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200/80 dark:border-gray-800/50 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} BayaniLink &mdash; Ligao City, Albay, Philippines. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built for the people of Ligao City.
          </p>
        </div>
      </div>
    </footer>
  )
}
