import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandPanel from '../components/BrandPanel'
import { getErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'))
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
              ✂ FORM MS-01 · SIGN-IN
            </span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">Sign in to manage your inventory</p>

          {error && (
            <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-brand-600 transition"
                placeholder="you@pharmacy.com"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-brand-600 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-canvas hover:bg-canvas-light text-white font-medium py-2.5 rounded-md transition disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Authorized personnel only
          </div>

          <p className="text-sm text-slate-500 mt-8">
            No account? <Link to="/register" className="text-brand-600 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
