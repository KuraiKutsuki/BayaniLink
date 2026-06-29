import Link from 'next/link'
import Image from 'next/image'
import { ShieldAlert, FileText, Phone, MapPin, Clock, HeartPulse, ArrowRight, MessageSquare } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative z-10 max-w-screen-lg mx-auto px-4 pt-10 pb-16 text-center">
        {/* LGU Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-6 transition-all duration-300">
          <MapPin size={12} className="text-red-500" />
          Ligao City, Albay, Philippines
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] transition-colors duration-300">
          Every Second Counts.<br />
          <span className="text-red-600 dark:text-red-500">
            Report Emergencies Instantly.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base md:text-lg mt-6 leading-relaxed transition-colors duration-300">
          BayaniLink connects you directly with the <strong className="font-extrabold text-gray-900 dark:text-white">Ligao City CDRRMO</strong> response team. Send real-time geo-tagged reports, pin locations on a map, and upload images to help responders act fast.
        </p>

        {/* Call to Actions (CTAs) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/report"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-base shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 focus:outline-none scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <ShieldAlert size={20} className="stroke-[2.5]" />
            Report an Emergency
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/guidelines"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-base shadow-sm scale-100 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 focus:outline-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Safety Guidelines
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-screen-lg mx-auto px-4 py-8 border-t border-gray-200/60 dark:border-gray-800/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <ScrollReveal delay={0} desktopDelay={0}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 h-full">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 shadow-inner">
                <Clock size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Real-Time Routing</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Reports are dispatched instantly and synced in real time to the CDRRMO dashboard, bypassing response delays.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={100} desktopDelay={100}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 h-full">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 shadow-inner">
                <MapPin size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Precise Map Pinning</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Draggable interactive mapping automatically detects street names and pinpoints your local Albay barangay.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={200} desktopDelay={200}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 h-full">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 shadow-inner">
                <HeartPulse size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Immediate First Aid</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Review safety protocols for floods, fires, medical emergencies, and wire issues while responders are in route.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 4 */}
          <ScrollReveal delay={300} desktopDelay={300}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 h-full">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-inner">
                <MessageSquare size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">AI Dispatch Assistant</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Consult our virtual helper for real-time safety checklists, response guidelines, and first aid tips.
              </p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Emergency Call Box */}
      <section className="relative z-10 max-w-screen-lg mx-auto px-4 py-8 pb-16">
        <div className="bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30 animate-pulse">
              <Phone size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Prefer to speak to an operator?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                Dial the local rescue line immediately for verbal assistance.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <a
              href="tel:911"
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-sm text-center hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 focus:outline-none"
            >
              Call 911
            </a>
            <Link
              href="/hotlines"
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold text-sm text-center hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 focus:outline-none"
            >
              All Hotlines
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  )
}
