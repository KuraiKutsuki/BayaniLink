import CitizenForm from '@/components/CitizenForm'
import QuickDial from '@/components/QuickDial'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-slate-50 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 dark:bg-gray-950/80 light:bg-white/80 backdrop-blur-md border-b border-gray-800/50 dark:border-gray-800/50 light:border-gray-200/80 transition-colors duration-300">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-lg">🆘</span>
          </div>
          <div>
            <h1 className="text-white dark:text-white light:text-gray-900 font-bold text-base leading-none transition-colors duration-300">
              Bayanilink
            </h1>
            <p className="text-gray-500 dark:text-gray-500 light:text-gray-500 text-xs">
              Ligao City Emergency Reporting
            </p>
          </div>
          {/* Right side: Live badge + Theme toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-900/30 dark:bg-green-900/30 light:bg-green-100 border border-green-500/30 dark:border-green-500/30 light:border-green-400/50 text-green-400 dark:text-green-400 light:text-green-700 text-xs font-medium transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-400 light:bg-green-600 animate-pulse" />
              Live
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-red-950/60 dark:from-red-950/60 light:from-red-100/80 to-gray-950 dark:to-gray-950 light:to-slate-50 border-b border-gray-800/50 dark:border-gray-800/50 light:border-red-100 transition-colors duration-300">
        <div className="max-w-lg mx-auto px-4 py-6">
          <p className="text-red-400 dark:text-red-400 light:text-red-600 text-xs font-semibold uppercase tracking-widest mb-1">
            🏙️ Ligao City, Albay
          </p>
          <h2 className="text-2xl font-extrabold text-white dark:text-white light:text-gray-900 leading-tight transition-colors duration-300">
            Report an Emergency
          </h2>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mt-1.5 transition-colors duration-300">
            Your report goes directly to the CDRRMO response team.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        <CitizenForm />
      </div>

      {/* Floating Quick Dial */}
      <QuickDial />
    </main>
  )
}
