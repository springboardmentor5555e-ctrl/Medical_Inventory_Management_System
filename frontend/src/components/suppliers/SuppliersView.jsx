import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import EmptyState from '../common/EmptyState'
import { SkeletonRows } from '../common/SkeletonLoader'
import { useAuth } from '../../context/AuthContext'

export default function SuppliersView({
  suppliers = [],
  openDrawer,
  openDetails,
  onDelete,
  loading,
}) {
  const { canWrite, canDelete } = useAuth()
  const [search, setSearch] = useState('')

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
    )
  }, [suppliers, search])

  return (
    <div className="space-y-4 pb-12">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, company, or city..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => openDrawer(null)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <SkeletonRows count={5} />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80">
          <EmptyState
            title="No Suppliers Found"
            text={
              search
                ? 'No supplier matched your search query.'
                : 'Start building your supplier directory to link medicines.'
            }
            actionLabel={canWrite && !search ? 'Add First Supplier' : undefined}
            onAction={canWrite && !search ? () => openDrawer(null) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {supplier.supplierName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{supplier.companyName}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200 shrink-0">
                    {supplier.performance || 'Verified'}
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {supplier.email?.endsWith('@medistock.local') ? 'Not specified' : supplier.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {supplier.city}, {supplier.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : 'Active Distributor'}
                </span>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openDetails(supplier)}
                    title="View Details"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => openDrawer(supplier)}
                      title="Edit Supplier"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(supplier.id)}
                      title="Delete Supplier"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
