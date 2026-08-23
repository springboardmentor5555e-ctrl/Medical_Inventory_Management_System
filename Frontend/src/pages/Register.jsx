import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandPanel from '../components/BrandPanel'
import { getErrorMessage } from '../api/client'

const ROLES = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'ADMIN', label: 'Admin' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STAFF' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.fullName, form.email, form.password, form.role)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="border-t-2 border-dashed border-slate-300 pt-6 mb-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-50 px-3 font-mono text-[10px] tracking-widest text-slate-400">
              ✂ FORM MS-02 · INTAKE
            </span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">Create account</h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">Join your organization's MediStock workspace</p>

          {error && (
            <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Full name</label>
              <input required value={form.fullName} onChange={update('fullName')}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-brand-600 transition" />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Email</label>
              <input type="email" required value={form.email} onChange={update('email')}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-brand-600 transition" />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Password</label>
              <input type="password" required value={form.password} onChange={update('password')}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-brand-600 transition" />
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500 mb-2 block">Role</label>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex-1 text-sm font-medium py-2 rounded-md border transition ${
                      form.role === r.value
                        ? 'bg-canvas text-white border-canvas'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-canvas hover:bg-canvas-light text-white font-medium py-2.5 rounded-md transition disabled:opacity-60">
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-8">
            Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
