import React, { useEffect, useState } from 'react'
import { getExpiringSoon, getExpired, adjustStock } from '../api/medicines'
import Badge from '../components/Badge'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function ExpiryTracking() {
  const { user } = useAuth()
  const canAdjust = user?.role === 'ADMIN' || user?.role === 'PHARMACIST' || user?.role === 'STAFF'

  const [tab, setTab] = useState('expiring')
  const [expiringSoon, setExpiringSoon] = useState([])
  const [expired, setExpired] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([getExpiringSoon(60), getExpired()])
      .then(([soon, exp]) => {
        setExpiringSoon(soon.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)))
        setExpired(exp.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)))
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load expiry data')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleWriteOff = async (medicine) => {
    if (!window.confirm(`Write off all ${medicine.quantity} units of ${medicine.name}? This zeroes out its stock and logs the reason.`)) return
    try {
      await adjustStock(medicine.id, -medicine.quantity, 'Written off — expired stock')
      load()
    } catch (err) {
      alert(getErrorMessage(err, 'Could not write off stock'))
    }
  }

  const list = tab === 'expiring' ? expiringSoon : expired

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">Expiry Tracking</h1>
        <p className="text-slate-500 text-sm mt-1">Medicines expiring within 60 days, and medicines already past expiry</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('expiring')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'expiring' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Expiring Soon ({expiringSoon.length})
        </button>
        <button
          onClick={() => setTab('expired')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'expired' ? 'border-red-500 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Expired ({expired.length})
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-6">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Expiry Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canAdjust && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                {tab === 'expiring' ? 'Nothing expiring in the next 60 days.' : 'No expired medicines on record.'}
              </td></tr>
            ) : list.map((m) => {
              const days = daysUntil(m.expiryDate)
              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-4 py-3 text-slate-500">{m.batchNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{m.supplier?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{m.quantity}</td>
                  <td className="px-4 py-3 text-slate-500">{m.expiryDate}</td>
                  <td className="px-4 py-3">
                    {tab === 'expiring' ? (
                      <Badge tone={days <= 14 ? 'danger' : 'warning'}>{days} day{days === 1 ? '' : 's'} left</Badge>
                    ) : (
                      <Badge tone="danger">Expired {Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'} ago</Badge>
                    )}
                  </td>
                  {canAdjust && (
                    <td className="px-4 py-3 text-right">
                      {m.quantity > 0 && tab === 'expired' && (
                        <button onClick={() => handleWriteOff(m)} className="text-red-500 hover:underline text-xs">
                          Write off stock
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
