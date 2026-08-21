import { PackageOpen, Plus } from 'lucide-react'

export default function EmptyState({
  title,
  text,
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 ${
        compact ? 'py-6' : 'py-12'
      }`}
    >
      <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/80 text-slate-400 mb-3">
        <Icon className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{text}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
