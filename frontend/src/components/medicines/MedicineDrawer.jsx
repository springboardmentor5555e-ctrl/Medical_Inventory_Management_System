import { useState } from 'react'
import Drawer from '../common/Drawer'

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

function MedicineForm({ medicine, suppliers = [], onSave, close }) {
  const isEditing = Boolean(medicine?.id)

  const [form, setForm] = useState(() => {
    if (medicine) {
      return {
        medicineName: medicine.medicineName || '',
        genericName: medicine.genericName || '',
        brand: medicine.brand || '',
        category: medicine.category?.name || 'Antibiotic',
        supplierId: medicine.supplier?.id || (suppliers[0]?.id ? String(suppliers[0]?.id) : ''),
        batchNumber: medicine.batchNumber || '',
        barcode: medicine.barcode || '',
        manufacturingDate: medicine.manufacturingDate || '',
        expiryDate: medicine.expiryDate || '',
        purchasePrice: medicine.purchasePrice || '',
        sellingPrice: medicine.sellingPrice || '',
        quantity: medicine.quantity ?? '',
        reservedQuantity: medicine.reservedQuantity ?? 0,
        damagedQuantity: medicine.damagedQuantity ?? 0,
        minimumStock: medicine.minimumStock ?? 10,
        storageLocation: medicine.storageLocation || 'Main Store',
        description: medicine.description || '',
      }
    }
    return {
      medicineName: '',
      genericName: '',
      brand: '',
      category: 'Antibiotic',
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
      batchNumber: '',
      barcode: '',
      manufacturingDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      reservedQuantity: 0,
      damagedQuantity: 0,
      minimumStock: 10,
      storageLocation: 'Main Store',
      description: '',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      supplierId: Number(form.supplierId),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantity: Number(form.quantity),
      minimumStock: Number(form.minimumStock || 10),
      reservedQuantity: Number(form.reservedQuantity || 0),
      damagedQuantity: Number(form.damagedQuantity || 0),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Medicine Name & Generic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Medicine Commercial Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.medicineName}
            onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
            placeholder="e.g. Augmentin 625"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Generic Chemical Name
          </label>
          <input
            type="text"
            value={form.genericName}
            onChange={(e) => setForm({ ...form, genericName: e.target.value })}
            placeholder="e.g. Amoxicillin Clavulanate"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Category & Supplier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Therapeutic Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Authorized Supplier <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplierName} ({s.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Number & Barcode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batch / Lot Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.batchNumber}
            onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
            placeholder="e.g. AUG-625-2401"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Barcode / SKU Code
          </label>
          <input
            type="text"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            placeholder="e.g. 890100100004"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Manufacturing & Expiry Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Manufacturing Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.manufacturingDate}
            onChange={(e) => setForm({ ...form, manufacturingDate: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expiry Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Purchase Price & Selling Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Purchase Price (INR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            min="0"
            value={form.purchasePrice}
            onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Selling Price (INR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            min="0"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Quantity & Minimum Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current Stock Units <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Total quantity"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Minimum Alert Threshold <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={form.minimumStock}
            onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
            placeholder="Default: 10"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Brand & Storage Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Manufacturer / Brand
          </label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="e.g. GSK, Cipla"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Storage Location
          </label>
          <input
            type="text"
            value={form.storageLocation}
            onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
            placeholder="e.g. Rack B2, Cold Storage 1"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Clinical Notes / Instructions
        </label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Dosage guidelines or storage instructions..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
          {isEditing ? 'Save Changes' : 'Register Medicine'}
        </button>
      </div>
    </form>
  )
}

export default function MedicineDrawer({
  isOpen,
  close,
  medicine,
  suppliers = [],
  onSave,
}) {
  if (!isOpen) return null

  const isEditing = Boolean(medicine?.id)

  return (
    <Drawer
      title={isEditing ? 'Edit Medicine SKU' : 'Register New Medicine'}
      subtitle={isEditing ? `Modifying batch ${medicine?.batchNumber || ''}` : 'Add medicine to clinical inventory'}
      close={close}
    >
      <MedicineForm
        key={medicine?.id || 'new'}
        medicine={medicine}
        suppliers={suppliers}
        onSave={onSave}
        close={close}
      />
    </Drawer>
  )
}
