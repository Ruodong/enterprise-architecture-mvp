export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="panel p-6">
        <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="kpi-card h-24 animate-pulse bg-slate-100" />
        <div className="kpi-card h-24 animate-pulse bg-slate-100" />
        <div className="kpi-card h-24 animate-pulse bg-slate-100" />
      </div>
      <div className="panel h-72 animate-pulse bg-slate-100" />
    </div>
  )
}
