import { motion } from 'framer-motion'
import {
  Cross,
  CheckCircle2,
  Boxes,
  Activity,
  ShieldCheck,
  Truck,
  TrendingUp,
  Clock,
} from 'lucide-react'
import heroImg from '../../assets/hero.png'

export default function AuthHero() {
  const highlights = [
    { icon: Boxes, title: 'Inventory Tracking', desc: 'Real-time stock levels & batch tracking' },
    { icon: Activity, title: 'Stock Monitoring', desc: 'Instant low-stock & out-of-stock alarms' },
    { icon: Clock, title: 'Expiry Management', desc: 'Proactive 30-day alerts & risk safeguards' },
    { icon: Truck, title: 'Supplier Network', desc: 'Integrated vendor & order directories' },
    { icon: TrendingUp, title: 'Clinical Analytics', desc: 'Consumption curves & financial valuation' },
  ]

  return (
    <div className="relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[640px] lg:min-h-screen bg-[#0b1f33] text-white overflow-hidden">
      {/* Background image & gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f33]/95 via-[#0b1f33]/85 to-[#047857]/60" />

      {/* Decorative ambient light circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold tracking-wide"
        >
          <Cross className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span>MEDISTOCK HEALTHCARE OS</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Smart Medical Inventory <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Management Platform
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300/90 max-w-lg leading-relaxed font-normal">
            Automated batch control, real-time stock alerts, expiry prevention, and deep supplier intelligence designed for pharmacies, clinics, and modern hospital networks.
          </p>
        </motion.div>
      </div>

      {/* Feature highlights grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 my-8 sm:my-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white tracking-wide truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-300/80 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Footer Trust Metric */}
      <div className="relative z-10 flex items-center gap-6 pt-6 border-t border-white/10 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access & Audit Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Fail-safe Event Notifications</span>
        </div>
      </div>
    </div>
  )
}
