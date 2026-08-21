import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Clock,
  Package,
  Truck,
} from 'lucide-react'
import EmptyState from '../common/EmptyState'
import { SkeletonRows } from '../common/SkeletonLoader'

export default function NotificationsView({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onScanExpiry,
  loading,
}) {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [scanning, setScanning] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length
  const displayed = unreadOnly ? notifications.filter((n) => n.unread) : notifications

  const handleScan = async () => {
    setScanning(true)
    try {
      await onScanExpiry()
    } finally {
      setScanning(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'OUT_OF_STOCK':
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-rose-500" />
      case 'NEAR_EXPIRY':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'SUPPLIER_ADDED':
      case 'SUPPLIER_UPDATED':
      case 'SUPPLIER_DELETED':
        return <Truck className="w-5 h-5 text-sky-500" />
      case 'MEDICINE_DELETED':
        return <Trash2 className="w-5 h-5 text-rose-500" />
      default:
        return <Package className="w-5 h-5 text-emerald-500" />
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top action header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Healthcare Notification Center</h3>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread inventory alerts` : 'All alerts are up to date'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              unreadOnly
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'Show All'}
          </button>

          <button
            type="button"
            disabled={scanning}
            onClick={handleScan}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Scan Expiry</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonRows count={5} />
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            title="No Notifications Found"
            text={
              unreadOnly
                ? 'You have read all current notifications.'
                : 'Inventory alerts and automated expiry checks will be listed here.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {displayed.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  item.unread ? 'bg-emerald-50/25 hover:bg-emerald-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200/60 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600">
                      {item.type.replaceAll('_', ' ')}
                    </span>
                    {item.medicineId && (
                      <span className="text-[11px] font-semibold text-emerald-600">
                        SKU Reference #{item.medicineId}
                      </span>
                    )}
                  </div>
                </div>

                {item.unread && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark Read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
