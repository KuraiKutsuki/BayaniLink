import { Waves, Flame, Activity, Zap, ShieldAlert, HeartPulse, HeartHandshake } from 'lucide-react'

const GUIDELINES = [
  {
    title: 'Flood Safety',
    icon: Waves,
    color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5',
    pill: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    dos: [
      'Monitor local radio/TV or CDRRMO announcements for evacuation orders.',
      'Turn off main electricity, gas, and water valves before evacuating.',
      'Move valuable appliances, furniture, and documents to upper floors.',
      'Stay away from low-lying areas, drainage channels, and streams.',
    ],
    donts: [
      'Do not walk, swim, or drive through moving floodwaters.',
      'Do not touch electrical equipment while wet or standing in water.',
      'Do not let children play in or near floodwaters.',
    ],
  },
  {
    title: 'Fire Safety',
    icon: Flame,
    color: 'border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/5',
    pill: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    dos: [
      'If smoke is present, stay low to the floor and crawl to safety.',
      'Touch doors with the back of your hand before opening; if hot, find another exit.',
      'Stop, Drop, and Roll immediately if your clothes catch fire.',
      'Evacuate the building first before calling emergency services.',
    ],
    donts: [
      'Do not use elevators during a fire evacuation; always use stairs.',
      'Do not return to a burning building to retrieve belongings under any circumstances.',
    ],
  },
  {
    title: 'Medical Emergencies',
    icon: HeartPulse,
    color: 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5',
    pill: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    dos: [
      'Keep the patient warm, quiet, and reassured.',
      'For heavy bleeding, apply direct pressure with a clean cloth.',
      'Perform CPR if the patient is unresponsive and not breathing (if trained).',
      'Check for medical alert tags or bracelets identifying existing conditions.',
    ],
    donts: [
      'Do not move the victim if a neck, back, or spinal injury is suspected.',
      'Do not give liquids or food to an unconscious or semi-conscious patient.',
    ],
  },
  {
    title: 'Dangling Power Lines',
    icon: Zap,
    color: 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5',
    pill: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    dos: [
      'Assume all downed power lines are energized and dangerous.',
      'Maintain a distance of at least 10 meters (33 feet) from the downed wire.',
      'Warn others to stay far away and notify the CDRRMO or ALECO/APEC immediately.',
      'If a wire falls on your car, stay inside until emergency workers arrive.',
    ],
    donts: [
      'Do not touch wet surfaces or puddles anywhere near a fallen power line.',
      'Do not attempt to move the wire with sticks, brooms, or any other objects.',
    ],
  },
  {
    title: 'Earthquake Protocol',
    icon: ShieldAlert,
    color: 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5',
    pill: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    dos: [
      'Drop, Cover, and Hold on under heavy furniture like a table or desk.',
      'Stay indoors until the shaking stops, then evacuate calmly.',
      'Once outside, move to open spaces away from buildings, poles, and trees.',
      'Prepare for aftershocks and check yourself and others for injuries.',
    ],
    donts: [
      'Do not stand near windows, glass partitions, heavy shelves, or outer walls.',
      'Do not use elevators or run out of a building frantically during shaking.',
    ],
  },
]

export default function GuidelinesPage() {
  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-b from-red-50 dark:from-red-950/40 to-gray-50/0 dark:to-gray-950 border-b border-gray-200/60 dark:border-gray-800/40 py-6 transition-colors duration-300">
        <div className="max-w-screen-lg mx-auto px-4">
          <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake size={13} />
            Safety First
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
            Emergency Guidelines
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 transition-colors duration-300">
            Crucial protocols to protect yourself and others during critical hazards in Ligao City.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-8 pb-20">
        <div className="grid grid-cols-1 gap-8">
          {GUIDELINES.map((g) => {
            const Icon = g.icon
            return (
              <div 
                key={g.title}
                className={`backdrop-blur-md bg-white/75 dark:bg-gray-900/60 border rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/5 dark:shadow-none transition-all duration-300 ${g.color}`}
              >
                {/* Header */}
                <div className="flex items-center gap-3.5 border-b border-gray-200/60 dark:border-gray-800/40 pb-4 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-current shadow-sm">
                    <Icon size={20} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{g.title}</h3>
                </div>

                {/* Lists Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* DO list */}
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400">
                      ✓ What to Do
                    </span>
                    <ul className="space-y-2.5">
                      {g.dos.map((item, idx) => (
                        <li key={idx} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex items-start gap-2">
                          <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DON'T list */}
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400">
                      ✗ What to Avoid
                    </span>
                    <ul className="space-y-2.5">
                      {g.donts.map((item, idx) => (
                        <li key={idx} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex items-start gap-2">
                          <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
