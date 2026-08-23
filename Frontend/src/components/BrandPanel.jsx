import React, { useEffect, useState } from 'react'

const STATS = [
  { label: 'Units tracked', value: '12,480+' },
  { label: 'Active suppliers', value: '340' },
  { label: 'Expiry accuracy', value: '99.7%' },
]

/**
 * Left-hand brand panel for the auth screens. Styled like a pharmacy stock
 * label rather than a generic SaaS gradient — dot-grid "blister pack" texture,
 * a specimen-label card with monospace batch/lot fields, and a slow ticking
 * counter for a bit of life without being distracting.
 */
export default function BrandPanel() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative hidden lg:flex lg:w-1/2 bg-canvas text-white flex-col justify-between p-12 overflow-hidden">
      {/* blister-pack dot texture */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10">
        <p className="font-mono text-xs tracking-widest text-emerald-300/70 mb-3">MEDISTOCK · INVENTORY OS</p>
        <h1 className="font-display text-4xl font-semibold leading-tight">
          Every dose,<br />accounted for.
        </h1>
        <p className="text-emerald-50/70 mt-4 max-w-sm text-sm leading-relaxed">
          Stock levels, expiry dates, and supplier records — tracked in real time
          across your pharmacy or hospital network.
        </p>
      </div>

      {/* specimen label card */}
      <div className="relative z-10 bg-canvas-light/60 border border-white/10 rounded-lg p-5 max-w-sm backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-dashed border-white/20 pb-3 mb-3">
          <span className="font-mono text-[10px] tracking-widest text-white/50">FORM MS-01</span>
          <span className="font-mono text-[10px] tracking-widest text-emerald-300/70">● LIVE</span>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[10px] uppercase tracking-wide text-white/40">{s.label}</dt>
              <dd className="font-display text-lg font-semibold mt-1">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="font-mono text-[10px] text-white/30 mt-4">
          SYNC #{String(1000 + tick).padStart(5, '0')} · verified just now
        </p>
      </div>

      <p className="relative z-10 font-mono text-[11px] text-white/30">
        © {new Date().getFullYear()} MediStock — for pharmacies, hospitals & clinics
      </p>
    </div>
  )
}
