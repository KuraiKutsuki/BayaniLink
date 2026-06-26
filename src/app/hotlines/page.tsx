import { Phone, Shield, Flame, Activity, Zap, Heart, ShieldAlert, Award } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

const AGENCIES = [
  {
    name: 'Ligao City CDRRMO',
    type: 'Disaster Risk Reduction & Rescue',
    number: '(052) 481-0012',
    description: 'City Disaster Risk Reduction and Management Office. Primary dispatch for natural disasters, weather, and general rescue emergencies.',
    icon: ShieldAlert,
    accent: 'border-red-500/30 text-red-600 dark:text-red-400',
  },
  {
    name: 'Emergency / Rescue (National)',
    type: 'National Hotlines',
    number: '911',
    description: 'National emergency hotline. Toll-free voice dispatch for police, fire, rescue, and ambulance services nationwide.',
    icon: Phone,
    accent: 'border-red-500/30 text-red-600 dark:text-red-400',
  },
  {
    name: 'Ligao City BFP Fire Station',
    type: 'Fire & Incident Response',
    number: '(052) 481-0624',
    description: 'Bureau of Fire Protection - Ligao City. Call for fire outbreaks, structural collapses, hazardous leaks, and emergency assistance.',
    icon: Flame,
    accent: 'border-orange-500/30 text-orange-600 dark:text-orange-400',
  },
  {
    name: 'Ligao City Police Station (PNP)',
    type: 'Law Enforcement & Safety',
    number: '(052) 481-0035',
    description: 'Philippine National Police - Ligao. Reach out for crime reporting, public safety, traffic collisions, and law enforcement support.',
    icon: Shield,
    accent: 'border-blue-500/30 text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Red Cross Albay Chapter',
    type: 'Blood Bank & Medical Relief',
    number: '(052) 820-3232',
    description: 'Philippine Red Cross - Albay. Contact for blood donation supplies, first-aid training, and secondary disaster relief operations.',
    icon: Heart,
    accent: 'border-pink-500/30 text-pink-600 dark:text-pink-400',
  },
  {
    name: 'City Health Office (CHO)',
    type: 'Public Health & Ambulance',
    number: '(052) 481-0089',
    description: 'Ligao City Health Office. Inquiries on local health clinics, immunization campaigns, and local ambulance transfers.',
    icon: Activity,
    accent: 'border-green-500/30 text-green-600 dark:text-green-400',
  },
  {
    name: 'Albay Power Co. (APEC/ALECO)',
    type: 'Electricity & Utility Faults',
    number: '(052) 742-5600',
    description: 'Power distributor hotline. Report live wires, transformer damage, power outages, and electrical sparks.',
    icon: Zap,
    accent: 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
  },
]

export default function HotlinesPage() {
  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="relative border-b border-gray-200 dark:border-gray-800/60 py-6 transition-colors duration-300">
        <div className="max-w-screen-lg mx-auto px-4">
          <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award size={13} />
            LGU Responders
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
            Emergency Hotlines Directory
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 transition-colors duration-300">
            Immediate voice lines connecting you to local government responders and utility services in Ligao City, Albay.
          </p>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-screen-lg mx-auto px-4 py-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AGENCIES.map((agency, index) => {
            const Icon = agency.icon
            const col = index % 2
            const row = Math.floor(index / 2)
            const desktopDelay = (row + col) * 100
            const delay = index === 1 ? 100 : 0
            return (
              <ScrollReveal key={agency.name} delay={delay} desktopDelay={desktopDelay}>
                <div 
                  className={`bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col justify-between h-full focus-within:ring-2 focus-within:ring-red-500/20 ${agency.accent}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200/60 dark:border-gray-700">
                        {agency.type}
                      </span>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-current shadow-sm">
                        <Icon size={16} className="stroke-[2.5]" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">
                      {agency.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
                      {agency.description}
                    </p>
                  </div>

                  {/* Call Action Bar */}
                  <div className="mt-6 pt-4 border-t border-gray-200/40 dark:border-gray-800/40 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Hotline Number</span>
                      <span className="text-base font-extrabold text-gray-900 dark:text-white font-mono mt-0.5 block tracking-wide">
                        {agency.number}
                      </span>
                    </div>
                    <a
                      href={`tel:${agency.number.replace(/[^0-9+]/g, '')}`}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 focus:outline-none"
                    >
                      <Phone size={12} className="stroke-[2.5]" /> Call Now
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>

    </div>
  )
}
