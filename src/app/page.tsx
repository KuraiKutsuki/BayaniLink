import CitizenForm from '@/components/CitizenForm'
import QuickDial from '@/components/QuickDial'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-lg">🆘</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">Bayanilink</h1>
            <p className="text-gray-500 text-xs">Ligao City Emergency Reporting</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-red-950/60 to-gray-950 border-b border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">
            🏙️ Ligao City, Albay
          </p>
          <h2 className="text-2xl font-extrabold text-white leading-tight">
            Report an Emergency
          </h2>
          <p className="text-gray-400 text-sm mt-1.5">
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
