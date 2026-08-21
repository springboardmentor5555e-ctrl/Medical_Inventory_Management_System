import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, close }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      close()
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast, close])

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  }

  const borders = {
    success: 'border-emerald-500/20 bg-white/95 text-slate-800 shadow-emerald-500/5',
    warning: 'border-amber-500/20 bg-white/95 text-slate-800 shadow-amber-500/5',
    error: 'border-rose-500/20 bg-white/95 text-slate-800 shadow-rose-500/5',
    info: 'border-sky-500/20 bg-white/95 text-slate-800 shadow-sky-500/5',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-md max-w-md ${borders[toast.type] || borders.info}`}
        role="alert"
      >
        {icons[toast.type] || icons.info}
        <div className="text-sm font-medium text-slate-700 leading-snug flex-1">
          {toast.message}
        </div>
        <button
          onClick={close}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
