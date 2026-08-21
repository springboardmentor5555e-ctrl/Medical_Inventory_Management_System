import { useState } from 'react'
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Bookmark,
  AlertCircle,
  History,
} from 'lucide-react'
import EmptyState from '../common/EmptyState'
import { SkeletonRows } from '../common/SkeletonLoader'
import { useAuth } from '../../context/AuthContext'

export default function StockHistoryView({
  medicines = [],
  stockLogs = [],
  onMutateStock,
  loading,
}) {
  const { canManageStock } = useAuth()
  const [form, setForm] = useState({
    medicineId: '',
    type: 'STOCK_IN',
    quantity: '',
    reason: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.medicineId || !form.quantity) return
    onMutateStock(Number(form.medicineId), {
      type: form.type,
      quantity: Number(form.quantity),
      reason: form.reason.trim() || `${form.type.replaceAll('_', ' ')} update`,
    })
    setForm({ medicineId: '', type: 'STOCK_IN', quantity: '', reason: '' })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
      case 'STOCK_OUT':
        return <ArrowUpCircle className="w-4 h-4 text-rose-600" />
      case 'ADJUSTMENT':
        return <RotateCcw className="w-4 h-4 text-sky-600" />
      case 'RESERVE':
      case 'RELEASE_RESERVATION':
        return <Bookmark className="w-4 h-4 text-amber-600" />
      case 'MARK_DAMAGED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-slate-600" />
    }
  }

  const selectedMed = medicines.find((m) => String(m.id) === String(form.medicineId))
  const currentAvailable = selectedMed ? selectedMed.availableQuantity ?? selectedMed.quantity : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Left / Main: Stock History Logs (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Inventory Movement Logs</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {stockLogs.length} total events
            </span>
          </div>

          {loading ? (
            <div className="p-6">
              <SkeletonRows count={6} />
            </div>
          ) : stockLogs.length === 0 ? (
            <EmptyState
              title="No Movement Logs"
              text="Stock additions, dispensations, and adjustments will be recorded here."
            />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
              {stockLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {log.medicineName}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase">
                        {log.type.replaceAll('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {log.previousQuantity} units → {log.newQuantity} units
                      </span>
                      <span className="text-xs text-slate-400">
                        ({log.quantity > 0 && log.type === 'STOCK_IN' ? `+${log.quantity}` : log.quantity})
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 italic">
                      &ldquo;{log.reason}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Stock Mutation Form (4 cols) */}
      {canManageStock && (
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 h-fit sticky top-20">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Record Stock Movement</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Medicine <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.medicineId}
                onChange={(e) => setForm({ ...form, medicineId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Choose medicine SKU</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.medicineName} ({m.availableQuantity ?? m.quantity} avail)
                  </option>
                ))}
              </select>
              {currentAvailable !== null && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Current Available: {currentAvailable} units
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Movement Action <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              >
                <option value="STOCK_IN">STOCK IN (Restock delivery)</option>
                <option value="STOCK_OUT">STOCK OUT (Dispensation)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit count set)</option>
                <option value="RESERVE">RESERVE (Hold stock)</option>
                <option value="RELEASE_RESERVATION">RELEASE RESERVATION</option>
                <option value="MARK_DAMAGED">MARK DAMAGED (Quarantine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Number of units..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Note <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Monthly batch arrival, Prescription #8821"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99]"
            >
              Commit Stock Movement
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
