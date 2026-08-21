import { motion } from 'framer-motion'

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'emerald',
  trend,
  onClick,
}) {
  const tones = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    navy: {
      bg: 'bg-slate-800/10 text-slate-800 border-slate-800/20',
      badge: 'bg-slate-100 text-slate-700',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      badge: 'bg-amber-50 text-amber-700',
    },
    red: {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      badge: 'bg-rose-50 text-rose-700',
    },
    blue: {
      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      badge: 'bg-sky-50 text-sky-700',
    },
  }

  const currentTone = tones[tone] || tones.emerald

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${currentTone.bg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {trend && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{trend.label}</span>
          <span className={`font-semibold ${currentTone.badge} px-2 py-0.5 rounded-md`}>
            {trend.value}
          </span>
        </div>
      )}
    </motion.div>
  )
}
