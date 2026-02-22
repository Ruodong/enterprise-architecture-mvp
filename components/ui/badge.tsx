import { cn } from '@/lib/utils'

export function Badge({
  children,
  className,
  tone = 'slate'
}: {
  children: React.ReactNode
  className?: string
  tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose'
}) {
  const toneMap = {
    slate: 'bg-slate-100/90 text-slate-700 border border-slate-200/80',
    blue: 'bg-sky-100/90 text-sky-700 border border-sky-200/90',
    emerald: 'bg-emerald-100/90 text-emerald-700 border border-emerald-200/90',
    amber: 'bg-amber-100/90 text-amber-700 border border-amber-200/90',
    rose: 'bg-rose-100/90 text-rose-700 border border-rose-200/90'
  }

  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', toneMap[tone], className)}>{children}</span>
}
