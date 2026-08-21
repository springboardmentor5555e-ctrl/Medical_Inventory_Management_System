import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Clock, AlertTriangle, AlertCircle, Package, Truck, ArrowRight } from 'lucide-react'

export default function NotificationDropdown({
  isOpen,
  close,
  notifications = [],
  markRead,
  markAllRead,
  viewAll,
}) {
  if (!isOpen) return null

  const unreadList = notifications.filter((n) => n.unread)
  const displayList = notifications.slice(0, 6)

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'OUT_OF_STOCK':
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-rose-500" />
      case 'NEAR_EXPIRY':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'SUPPLIER_ADDED':
      case 'SUPPLIER_UPDATED':
      case 'SUPPLIER_DELETED':
        return <Truck className="w-4 h-4 text-sky-500" />
      default:
        return <Package className="w-4 h-4 text-emerald-500" />
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unreadList.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unreadList.length} new
                </span>
              )}
            </div>
            {unreadList.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto custom-scrollbar">
            {displayList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              displayList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    item.unread ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100/80 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.message}</p>
                  </div>
                  {item.unread && (
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      title="Mark as read"
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                close()
                viewAll()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1 px-3 rounded-lg hover:bg-emerald-50/60 transition-colors"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
