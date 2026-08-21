export function SkeletonRows({ count = 5 }) {
  return (
    <div className="space-y-3 py-2 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-12 bg-slate-100/80 rounded-xl w-full" />
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-28 bg-slate-100/80 rounded-2xl border border-slate-200/50" />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="h-64 bg-slate-100/80 rounded-2xl border border-slate-200/50 flex items-center justify-center animate-pulse">
      <div className="w-1/3 h-4 bg-slate-200/70 rounded-full" />
    </div>
  )
}
