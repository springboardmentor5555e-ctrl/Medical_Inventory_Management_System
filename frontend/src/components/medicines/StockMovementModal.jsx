import { useState } from 'react'
import Modal from '../common/Modal'
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Bookmark, AlertCircle } from 'lucide-react'

export default function StockMovementModal({ medicine, close, onSave }) {
  const [type, setType] = useState('STOCK_IN')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  if (!medicine) return null

  const available = medicine.availableQuantity ?? medicine.quantity

  const types = [
    { id: 'STOCK_IN', label: 'Stock In (Restock)', icon: ArrowDownCircle, desc: 'Add newly delivered inventory' },
    { id: 'STOCK_OUT', label: 'Stock Out (Dispense)', icon: ArrowUpCircle, desc: 'Dispense or sell units' },
    { id: 'ADJUSTMENT', label: 'Stock Adjustment', icon: RotateCcw, desc: 'Physical audit correction' },
    { id: 'RESERVE', label: 'Reserve Units', icon: Bookmark, desc: 'Hold units for surgery or transfer' },
    { id: 'RELEASE_RESERVATION', label: 'Release Hold', icon: Bookmark, desc: 'Return reserved units to available' },
    { id: 'MARK_DAMAGED', label: 'Mark Damaged / Quarantined', icon: AlertCircle, desc: 'Broken ampoules or expired seal' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!quantity || Number(quantity) <= 0) return
    onSave(medicine.id, {
      type,
      quantity: Number(quantity),
      reason: reason.trim() || `${type.replaceAll('_', ' ')} adjustment`,
    })
  }

  return (
    <Modal title={`Update Stock: ${medicine.medicineName}`} close={close} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Batch {medicine.batchNumber}</p>
            <p className="text-[11px] text-slate-400">Location: {medicine.storageLocation || 'Main Store'}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium">Available Units</span>
            <p className="text-base font-extrabold text-emerald-600">{available}</p>
          </div>
        </div>

        {/* Movement Type Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Movement Action
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {types.map((t) => {
              const Icon = t.icon
              const isSelected = type === t.id
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">{t.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quantity (Units) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter unit count..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Reason / Reference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Clinical Notes <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Regular monthly restock, Ward 3 requisition, Audit delta..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            Execute Movement
          </button>
        </div>
      </form>
    </Modal>
  )
}
