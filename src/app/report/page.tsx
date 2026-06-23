import CitizenForm from '@/components/CitizenForm'
import { MapPin } from 'lucide-react'

export default function ReportPage() {
  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-gradient-to-b from-red-50 dark:from-red-950/40 to-gray-50/0 dark:to-gray-950 transition-colors duration-300">
      {/* Banner */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
          <MapPin size={13} />
          Ligao City, Albay
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
          Report an Emergency
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 transition-colors duration-300">
          Provide accurate details below. Your submission is transmitted in real time to the CDRRMO.
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-screen-lg mx-auto px-4 py-6 pb-20">
        <CitizenForm />
      </div>
    </div>
  )
}
