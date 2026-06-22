import Image from 'next/image'
import CitizenForm from '@/components/CitizenForm'
import QuickDial from '@/components/QuickDial'
import ThemeToggle from '@/components/ThemeToggle'
import { MapPin, Phone } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            <Image src="/BayaniLink.png" alt="BayaniLink Logo" width={36} height={36} priority style={{ width: '36px', height: '36px' }} />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white font-bold text-base leading-none transition-colors duration-300">
              BayaniLink
            </h1>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Ligao City Emergency Reporting
            </p>
          </div>
          {/* Right side: Live badge + Theme toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-400/50 dark:border-green-500/30 text-green-700 dark:text-green-400 text-xs font-medium transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
              Live
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-red-50 dark:from-red-950/60 to-gray-50/0 dark:to-gray-950 border-b border-gray-200/60 dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">
            <MapPin size={12} />
            Ligao City, Albay
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
            Report an Emergency
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 transition-colors duration-300">
            Your report goes directly to the CDRRMO response team.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <CitizenForm />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800/50 bg-gray-100 dark:bg-gray-900/40 mt-4 transition-colors duration-300">
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

      {/* Floating Quick Dial */}
      <QuickDial />
    </main>
  )
}
