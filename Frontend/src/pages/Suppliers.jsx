import React, { useEffect, useState, useCallback } from 'react'
import * as suppliersApi from '../api/suppliers'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

const emptyForm = { name: '', contactNumber: '', email: '', address: '' }

export default function Suppliers() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'PHARMACIST'
  const canDelete = user?.role === 'ADMIN'

  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    suppliersApi.getSuppliers(search)
      .then(setSuppliers)
      .catch((err) => setError(getErrorMessage(err, 'Could not load suppliers')))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setSaveError(''); setModalOpen(true) }
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contactNumber: s.contactNumber || '', email: s.email || '', address: s.address || '' }); setSaveError(''); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    try {
      if (editing) await suppliersApi.updateSupplier(editing.id, form)
      else await suppliersApi.createSupplier(form)
      setModalOpen(false)
      load()
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save supplier'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier? Medicines linked to it will keep their data — they just lose the supplier tag.')) return
    await suppliersApi.deleteSupplier(id)
    load()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 text-sm mt-1">{suppliers.length} suppliers</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-md text-sm transition">
            + Add Supplier
          </button>
        )}
      </div>

      <input
        placeholder="Search suppliers…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm mb-6"
      />

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-6">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : suppliers.length === 0 ? (
          <p className="text-slate-400 text-sm">No suppliers found.</p>
        ) : suppliers.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-slate-800">{s.name}</h3>
              <div className="space-x-2 text-xs">
                {canEdit && <button onClick={() => openEdit(s)} className="text-brand-600 hover:underline">Edit</button>}
                {canDelete && <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">Delete</button>}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-500 space-y-1">
              {s.contactNumber && <p>📞 {s.contactNumber}</p>}
              {s.email && <p>✉️ {s.email}</p>}
              {s.address && <p>📍 {s.address}</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{saveError}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Supplier name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contact number</label>
            <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={2} />
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md transition">
            {editing ? 'Save changes' : 'Add supplier'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
