import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Drawer({ title, subtitle, close, children, width = 'max-w-xl' }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={close}
        />
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`w-screen ${width} bg-white shadow-2xl border-l border-slate-200/80 flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={close}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
