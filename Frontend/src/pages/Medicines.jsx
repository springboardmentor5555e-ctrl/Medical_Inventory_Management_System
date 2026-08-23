import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as medicinesApi from '../api/medicines'
import { getSuppliers } from '../api/suppliers'
import { getCategories, createCategory, deleteCategory } from '../api/categories'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  name: '', batchNumber: '', categoryId: '', supplierId: '',
  quantity: '', manufacturingDate: '', expiryDate: '', price: '', lowStockThreshold: 20,
}

const ACTION_META = {
  STOCK_IN: { text: 'Stock in', tone: 'success' },
  STOCK_OUT: { text: 'Stock out', tone: 'danger' },
  ADJUSTMENT: { text: 'Adjustment', tone: 'default' },
  INITIAL: { text: 'Initial stock', tone: 'success' },
}

function statusBadge(m) {
  const today = new Date().toISOString().slice(0, 10)
  if (m.expiryDate < today) return <Badge tone="danger">Expired</Badge>
  if (m.quantity <= 0) return <Badge tone="danger">Out of stock</Badge>
  if (m.lowStockThreshold != null && m.quantity <= m.lowStockThreshold) return <Badge tone="warning">Low stock</Badge>
  return <Badge tone="success">In stock</Badge>
}

export default function Medicines() {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'PHARMACIST'
  const canDelete = user?.role === 'ADMIN'

  const [searchParams, setSearchParams] = useSearchParams()
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    categoryId: searchParams.get('categoryId') || '',
    supplierId: searchParams.get('supplierId') || '',
    stockStatus: searchParams.get('stockStatus') || '',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyMedicine, setHistoryMedicine] = useState(null)
  const [historyLogs, setHistoryLogs] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    medicinesApi.searchMedicines(params)
      .then(setMedicines)
      .catch(() => setError('Could not load medicines'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    getSuppliers().then(setSuppliers).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const applyFilters = (e) => {
    e.preventDefault()
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
    load()
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      name: m.name, batchNumber: m.batchNumber,
      categoryId: m.category?.id || '', supplierId: m.supplier?.id || '',
      quantity: m.quantity, manufacturingDate: m.manufacturingDate || '',
      expiryDate: m.expiryDate, price: m.price, lowStockThreshold: m.lowStockThreshold ?? 20,
    })
    setSaveError('')
    setModalOpen(true)
  }

  const openHistory = (m) => {
    setHistoryMedicine(m)
    setHistoryOpen(true)
    setHistoryLoading(true)
    medicinesApi.getStockHistory(m.id)
      .then(setHistoryLogs)
      .catch(() => setHistoryLogs([]))
      .finally(() => setHistoryLoading(false))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      supplierId: form.supplierId || null,
      quantity: Number(form.quantity),
      price: Number(form.price),
      lowStockThreshold: Number(form.lowStockThreshold),
    }
    try {
      if (editing) {
        await medicinesApi.updateMedicine(editing.id, payload)
      } else {
        await medicinesApi.createMedicine(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save medicine')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine? This cannot be undone.')) return
    await medicinesApi.deleteMedicine(id)
    load()
  }

  const handleStockAdjust = async (m, delta) => {
    const note = delta > 0 ? 'Manual stock-in from UI' : 'Manual stock-out from UI'
    try {
      await medicinesApi.adjustStock(m.id, delta, note)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not adjust stock')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    const cat = await createCategory({ name: newCategoryName.trim() })
    setCategories((prev) => [...prev, cat])
    setForm((f) => ({ ...f, categoryId: cat.id }))
    setNewCategoryName('')
  }

  const handleDeleteCategory = async (id) => {
    setCategoryError('')
    if (!window.confirm('Delete this category? Medicines using it will keep their data but lose this category tag.')) return
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      load()
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Could not delete category')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Medicines</h1>
          <p className="text-slate-500 text-sm mt-1">{medicines.length} items</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setCategoriesModalOpen(true)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-md text-sm transition">
              Manage Categories
            </button>
            <button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-md text-sm transition">
              + Add Medicine
            </button>
          </div>
        )}
      </div>

      <form onSubmit={applyFilters} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input
          placeholder="Search by name…"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="col-span-2 md:col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.supplierId} onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All suppliers</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.stockStatus} onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Any status</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2">
          Search
        </button>
      </form>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-400">No medicines found.</td></tr>
            ) : medicines.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                <td className="px-4 py-3 text-slate-500">{m.batchNumber}</td>
                <td className="px-4 py-3 text-slate-500">{m.category?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{m.supplier?.name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {canEdit && <button onClick={() => handleStockAdjust(m, -1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">-</button>}
                    <span>{m.quantity}</span>
                    {canEdit && <button onClick={() => handleStockAdjust(m, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">+</button>}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{m.expiryDate}</td>
                <td className="px-4 py-3 text-slate-500">₹{Number(m.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">{statusBadge(m)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openHistory(m)} className="text-slate-500 hover:underline">History</button>
                  {canEdit && <button onClick={() => openEdit(m)} className="text-brand-600 hover:underline">Edit</button>}
                  {canDelete && <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'}>
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{saveError}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Medicine name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Batch number</label>
              <input required value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
              <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-1 mt-1">
                <input placeholder="New category…" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs" />
                <button type="button" onClick={handleAddCategory} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 rounded-md">Add</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
              <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">None</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturing date</label>
              <input type="date" value={form.manufacturingDate} onChange={(e) => setForm({ ...form, manufacturingDate: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry date</label>
              <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Low-stock threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-md transition">
            {editing ? 'Save changes' : 'Add medicine'}
          </button>
        </form>
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title={historyMedicine ? `Stock History — ${historyMedicine.name}` : 'Stock History'}>
        {historyLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : historyLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No stock movements recorded for this medicine yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 -mx-2">
            {historyLogs.map((log) => {
              const meta = ACTION_META[log.action] || { text: log.action, tone: 'default' }
              return (
                <li key={log.id} className="px-2 py-3 flex justify-between items-start text-sm">
                  <div>
                    <Badge tone={meta.tone}>{meta.text}</Badge>
                    {log.note && <p className="text-slate-500 mt-1">{log.note}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${log.quantityChanged >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                    </p>
                    <p className="text-xs text-slate-400">→ {log.resultingQuantity} in stock</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>

      <Modal open={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} title="Manage Categories">
        {categoryError && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{categoryError}</div>}

        <div className="flex gap-2 mb-4">
          <input
            placeholder="New category name…"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={handleAddCategory} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 rounded-md">
            Add
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-400">No categories yet — add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => (
              <li key={c.id} className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-slate-700">{c.name}</span>
                {canDelete && (
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:underline text-xs">
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
