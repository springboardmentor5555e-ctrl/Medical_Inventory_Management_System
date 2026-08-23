import React from 'react'

export default function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-600',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    success: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
