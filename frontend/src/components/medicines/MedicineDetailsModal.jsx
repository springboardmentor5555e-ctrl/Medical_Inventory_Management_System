import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import { Pill } from 'lucide-react'

export default function MedicineDetailsModal({ medicine, close }) {
  if (!medicine) return null

  const items = [
    { label: 'Generic Name', value: medicine.genericName || 'Not specified' },
    { label: 'Brand / Manufacturer', value: medicine.brand || 'Generic' },
    { label: 'Therapeutic Category', value: medicine.category?.name || 'General' },
    { label: 'Authorized Supplier', value: medicine.supplier?.supplierName || 'Not assigned' },
    { label: 'Batch / Lot Number', value: medicine.batchNumber },
    { label: 'Barcode / SKU', value: medicine.barcode || 'None' },
    { label: 'Manufacturing Date', value: medicine.manufacturingDate },
    { label: 'Expiry Date', value: medicine.expiryDate },
    { label: 'Storage Location', value: medicine.storageLocation || 'Main Store' },
    { label: 'Purchase Cost', value: `Rs ${Number(medicine.purchasePrice).toFixed(2)}` },
    { label: 'Selling Price', value: `Rs ${Number(medicine.sellingPrice).toFixed(2)}` },
    { label: 'Minimum Stock Alert Level', value: `${medicine.minimumStock} units` },
  ]

  const total = medicine.quantity
  const available = medicine.availableQuantity ?? medicine.quantity
  const reserved = medicine.reservedQuantity ?? 0
  const damaged = medicine.damagedQuantity ?? 0

  return (
    <Modal title={medicine.medicineName} close={close} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-xs border border-emerald-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{medicine.medicineName}</h4>
              <p className="text-xs text-slate-500">{medicine.genericName} • {medicine.category?.name}</p>
            </div>
          </div>
          <StatusBadge status={medicine.status} size="sm" />
        </div>

        {/* Stock Breakdown Tiles */}
        <div>
          <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Stock Quantities & Allocation
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <span className="text-[11px] font-medium text-slate-400">Total Units</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{total}</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-center">
              <span className="text-[11px] font-medium text-emerald-600">Available</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{available}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-center">
              <span className="text-[11px] font-medium text-amber-600">Reserved</span>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{reserved}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-center">
              <span className="text-[11px] font-medium text-rose-600">Damaged</span>
              <p className="text-lg font-bold text-rose-700 mt-0.5">{damaged}</p>
            </div>
          </div>
        </div>

        {/* Technical & Clinical Details Grid */}
        <div>
          <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Specification & Storage
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white border border-slate-200/70 rounded-xl flex items-center justify-between"
              >
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <span className="text-xs font-bold text-slate-800 text-right truncate max-w-[180px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Notes if present */}
        {medicine.description && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h6 className="text-xs font-bold text-slate-700 mb-1">Clinical Instructions / Notes</h6>
            <p className="text-xs text-slate-600 leading-relaxed">{medicine.description}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
