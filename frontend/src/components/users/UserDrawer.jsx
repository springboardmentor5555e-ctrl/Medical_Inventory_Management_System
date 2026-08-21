import { useState } from 'react'
import Drawer from '../common/Drawer'

function UserForm({ user, onSave, close }) {
  const isEditing = Boolean(user?.id)

  const [form, setForm] = useState(() => {
    if (user) {
      return {
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'PHARMACIST',
      }
    }
    return {
      name: '',
      email: '',
      password: '',
      role: 'PHARMACIST',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Personnel Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Dr. Emily Watson"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Work Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="e.g. e.watson@hospital.org"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {isEditing ? 'New Password (leave blank to retain current)' : 'Account Password'}{' '}
          {!isEditing && <span className="text-rose-500">*</span>}
        </label>
        <input
          type="password"
          required={!isEditing}
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Min 8 characters..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Access Role <span className="text-rose-500">*</span>
        </label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
        >
          <option value="ADMIN">Administrator (Full Administrative Control)</option>
          <option value="PHARMACIST">Pharmacist (Manage Inventory, Stock, Suppliers)</option>
          <option value="STAFF">Staff (Stock Movements, Expiry Monitoring)</option>
        </select>
      </div>

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
          {isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}

export default function UserDrawer({
  isOpen,
  close,
  user,
  onSave,
}) {
  if (!isOpen) return null

  const isEditing = Boolean(user?.id)

  return (
    <Drawer
      title={isEditing ? 'Modify Personnel Account' : 'Provision Team Member'}
      subtitle={isEditing ? `User: ${user?.email || ''}` : 'Grant access to MediStock platform'}
      close={close}
    >
      <UserForm
        key={user?.id || 'new'}
        user={user}
        onSave={onSave}
        close={close}
      />
    </Drawer>
  )
}
