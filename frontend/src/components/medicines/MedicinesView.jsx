import { useState } from 'react'
import {
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Activity,
  SlidersHorizontal,
  X,
  Pill,
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import EmptyState from '../common/EmptyState'
import { SkeletonRows } from '../common/SkeletonLoader'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = [
  'Antibiotic',
  'Diabetes',
  'Analgesic',
  'Antihistamine',
  'Cardiology',
  'Dermatology',
  'Gastro',
  'Nutrition',
  'Emergency',
]

const STATUS_FILTERS = [
  { id: '', label: 'All Stock' },
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'LOW_STOCK', label: 'Low Stock' },
  { id: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { id: 'NEAR_EXPIRY', label: 'Near Expiry (30d)' },
  { id: 'EXPIRED', label: 'Expired' },
]

export default function MedicinesView({
  medicines = [],
  suppliers = [],
  filters,
  setFilters,
  openDrawer,
  openDetails,
  openStockModal,
  onDelete,
  onExportCsv,
  onImportCsv,
  loading,
}) {
  const { canWrite, canDelete, canManageStock, canViewReports } = useAuth()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }))
  }

  const handleSupplierChange = (e) => {
    setFilters((prev) => ({ ...prev, supplierId: e.target.value }))
  }

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const handleSortChange = (e) => {
    const [sortBy, direction] = e.target.value.split(':')
    setFilters((prev) => ({ ...prev, sortBy, direction }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      supplierId: '',
      status: '',
      sortBy: 'medicineName',
      direction: 'ASC',
    })
  }

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.supplierId || filters.status
  )

  return (
    <div className="space-y-4 pb-12">
      {/* Header Actions & Controls Card */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Search by name, generic, batch, or barcode..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, search: '' }))}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            {canViewReports && onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                title="Export catalog as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {canWrite && onImportCsv && (
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={onImportCsv}
                  className="hidden"
                />
              </label>
            )}

            {canWrite && (
              <button
                type="button"
                onClick={() => openDrawer(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {STATUS_FILTERS.map((s) => {
            const isActive = (filters.status || '') === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStatusFilter(s.id)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Advanced Filters Drawer / Row */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filter by Category
              </label>
              <select
                value={filters.category || ''}
                onChange={handleCategoryChange}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filter by Supplier
              </label>
              <select
                value={filters.supplierId || ''}
                onChange={handleSupplierChange}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Sort Inventory
              </label>
              <select
                value={`${filters.sortBy || 'medicineName'}:${filters.direction || 'ASC'}`}
                onChange={handleSortChange}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="medicineName:ASC">Medicine Name (A - Z)</option>
                <option value="medicineName:DESC">Medicine Name (Z - A)</option>
                <option value="quantity:ASC">Stock Quantity (Low to High)</option>
                <option value="quantity:DESC">Stock Quantity (High to Low)</option>
                <option value="expiryDate:ASC">Expiry Date (Earliest First)</option>
                <option value="sellingPrice:DESC">Selling Price (High to Low)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Medicine Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Pharmaceutical Inventory</h3>
            <span className="text-xs font-semibold text-slate-400">
              ({medicines.length} items listed)
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonRows count={6} />
          </div>
        ) : medicines.length === 0 ? (
          <EmptyState
            title="No Medicines Found"
            text="Try clearing active filters or register a new medicine SKU."
            actionLabel={canWrite ? 'Add Medicine' : undefined}
            onAction={canWrite ? () => openDrawer(null) : undefined}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Medicine & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Batch / Lot</th>
                  <th className="py-3.5 px-4 text-center">Available / Total</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {medicines.map((item) => {
                  const available = item.availableQuantity ?? item.quantity
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.medicineName}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.genericName} • {item.brand || 'Generic'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.supplier?.supplierName || 'Not linked'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">
                        {item.batchNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900">{available}</span>
                        <span className="text-slate-400"> / {item.quantity}</span>
                        {(item.reservedQuantity > 0 || item.damagedQuantity > 0) && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.reservedQuantity > 0 && `(Res: ${item.reservedQuantity}) `}
                            {item.damagedQuantity > 0 && `(Dam: ${item.damagedQuantity})`}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.expiryDate}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetails(item)}
                            title="View Full Details"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManageStock && (
                            <button
                              type="button"
                              onClick={() => openStockModal(item)}
                              title="Stock In / Out / Reserve"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          )}

                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => openDrawer(item)}
                              title="Edit Medicine"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item.id)}
                              title="Delete Record"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
