import React from 'react'

export default function StatCard({ label, value, tone = 'default', suffix = '' }) {
  const tones = {
    default: 'text-slate-800',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    success: 'text-emerald-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${tones[tone]}`}>{value}{suffix}</p>
    </div>
  )
}
