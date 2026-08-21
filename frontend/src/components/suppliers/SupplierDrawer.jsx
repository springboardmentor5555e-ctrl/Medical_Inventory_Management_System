import { useState } from 'react'
import Drawer from '../common/Drawer'

function SupplierForm({ supplier, onSave, close }) {
  const isEditing = Boolean(supplier?.id)

  const [form, setForm] = useState(() => {
    if (supplier) {
      return {
        supplierName: supplier.supplierName || '',
        companyName: supplier.companyName || '',
        phone: supplier.phone || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email?.endsWith('@medistock.local') ? '' : supplier.email || '',
        address: supplier.address === 'Not specified' ? '' : supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || 'India',
        gstNumber: supplier.gstNumber || '',
      }
    }
    return {
      supplierName: '',
      companyName: '',
      phone: '',
      contactPerson: '',
      email: '',
      address: '',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      gstNumber: '',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Supplier & Company Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Supplier / Trade Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.supplierName}
            onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
            placeholder="e.g. Apollo Health Supplies"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Registered Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="e.g. Apollo Distribution Pvt Ltd"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Phone & Contact Person */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone / Hotline <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 040-4856-1101"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Key Contact Person
          </label>
          <input
            type="text"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            placeholder="e.g. Ravi Kumar"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Email & GST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="orders@supplier.com"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            GST / Tax Identification
          </label>
          <input
            type="text"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
            placeholder="e.g. 36AAPCA4581L1Z5"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white uppercase"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Warehouse / Dispatch Address
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Street address, industrial area..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      {/* City, State, Country */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="City"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="State"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="Country"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
        </div>
      </div>

      {/* Action buttons */}
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
          {isEditing ? 'Update Supplier' : 'Save Supplier'}
        </button>
      </div>
    </form>
  )
}

export default function SupplierDrawer({
  isOpen,
  close,
  supplier,
  onSave,
}) {
  if (!isOpen) return null

  const isEditing = Boolean(supplier?.id)

  return (
    <Drawer
      title={isEditing ? 'Edit Supplier Profile' : 'Register New Supplier'}
      subtitle={isEditing ? `Vendor: ${supplier?.supplierName || ''}` : 'Add a verified medical distributor'}
      close={close}
    >
      <SupplierForm
        key={supplier?.id || 'new'}
        supplier={supplier}
        onSave={onSave}
        close={close}
      />
    </Drawer>
  )
}
