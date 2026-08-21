import { useState, useMemo } from 'react'
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react'
import EmptyState from '../common/EmptyState'
import { SkeletonRows } from '../common/SkeletonLoader'

export default function ExpiryView({
  medicines = [],
  onScanExpiry,
  openDetails,
  loading,
}) {
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [scanning, setScanning] = useState(false)

  // Categorize medicines based on actual database expiry dates
  const categorized = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in30Days = new Date(today)
    in30Days.setDate(today.getDate() + 30)

    const expired = []
    const nearExpiry = []
    const safe = []

    medicines.forEach((med) => {
      if (!med.expiryDate) {
        safe.push(med)
        return
      }
      const exp = new Date(med.expiryDate)
      exp.setHours(0, 0, 0, 0)

      if (exp < today) {
        expired.push(med)
      } else if (exp <= in30Days) {
        nearExpiry.push(med)
      } else {
        safe.push(med)
      }
    })

    return { expired, nearExpiry, safe }
  }, [medicines])

  const filteredMedicines = useMemo(() => {
    let list
    if (activeTab === 'EXPIRED') list = categorized.expired
    else if (activeTab === 'NEAR_EXPIRY') list = categorized.nearExpiry
    else if (activeTab === 'SAFE') list = categorized.safe
    else list = [...categorized.expired, ...categorized.nearExpiry, ...categorized.safe]

    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q)
    )
  }, [categorized, activeTab, search])

  const handleTriggerScan = async () => {
    setScanning(true)
    try {
      await onScanExpiry()
    } finally {
      setScanning(false)
    }
  }

  const daysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exp = new Date(expiryDateStr)
    exp.setHours(0, 0, 0, 0)
    const diffTime = exp.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Overview Tiles for Expiry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired */}
        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'EXPIRED'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-rose-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Expired Stock</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {categorized.expired.length} <span className="text-xs font-medium text-slate-400">SKUs</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">Quarantine immediately</p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Near Expiry */}
        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'NEAR_EXPIRY'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-amber-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Expiring in 30 Days</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {categorized.nearExpiry.length} <span className="text-xs font-medium text-slate-400">SKUs</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">Prioritize dispensation</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Safe Inventory */}
        <div
          onClick={() => setActiveTab('SAFE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'SAFE'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-emerald-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Safe Inventory</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {categorized.safe.length} <span className="text-xs font-medium text-slate-400">SKUs</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">&gt; 30 days valid shelf life</p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Scan Controls */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'EXPIRED', 'NEAR_EXPIRY', 'SAFE'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab === 'ALL'
                ? `All Stock (${medicines.length})`
                : tab === 'EXPIRED'
                ? `Expired (${categorized.expired.length})`
                : tab === 'NEAR_EXPIRY'
                ? `Near Expiry (${categorized.nearExpiry.length})`
                : `Safe (${categorized.safe.length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter list..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="button"
            disabled={scanning}
            onClick={handleTriggerScan}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Scan Expiry Now</span>
          </button>
        </div>
      </div>

      {/* Medicines Expiry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonRows count={5} />
          </div>
        ) : filteredMedicines.length === 0 ? (
          <EmptyState
            title="No Items Found"
            text="No medicines match the selected expiry risk bucket."
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Current Units</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left / Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredMedicines.map((med) => {
                  const days = daysRemaining(med.expiryDate)
                  const isExpired = days !== null && days < 0
                  const isNear = days !== null && days >= 0 && days <= 30

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {med.medicineName}
                        <div className="text-[11px] font-normal text-slate-400">{med.genericName}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {med.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {med.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {med.availableQuantity ?? med.quantity} units
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {med.expiryDate}
                      </td>
                      <td className="py-3 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Expired ({Math.abs(days)}d ago)
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {days === 0 ? 'Expires today' : `${days} days left`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Safe ({days}d)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDetails(med)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          View SKU
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
