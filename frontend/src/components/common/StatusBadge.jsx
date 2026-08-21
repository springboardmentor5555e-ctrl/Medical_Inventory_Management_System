export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null

  const s = String(status).toUpperCase()

  const configs = {
    AVAILABLE: {
      label: 'Available',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    LOW_STOCK: {
      label: 'Low Stock',
      style: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/10',
      dot: 'bg-amber-500',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      style: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10',
      dot: 'bg-rose-500',
    },
    NEAR_EXPIRY: {
      label: 'Near Expiry',
      style: 'bg-orange-50 text-orange-700 border-orange-200/80 ring-orange-500/10',
      dot: 'bg-orange-500',
    },
    EXPIRED: {
      label: 'Expired',
      style: 'bg-red-50 text-red-700 border-red-200/80 ring-red-500/10',
      dot: 'bg-red-600',
    },
    ADMIN: {
      label: 'Admin',
      style: 'bg-slate-100 text-slate-800 border-slate-300/80 ring-slate-500/10',
      dot: 'bg-slate-700',
    },
    PHARMACIST: {
      label: 'Pharmacist',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
      dot: 'bg-emerald-600',
    },
    STAFF: {
      label: 'Staff',
      style: 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10',
      dot: 'bg-sky-600',
    },
  }

  const config = configs[s] || {
    label: s.replaceAll('_', ' '),
    style: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  }

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 ${sizeClasses} ${config.style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
