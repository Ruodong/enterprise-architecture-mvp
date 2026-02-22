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
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700'
  }

  return <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', toneMap[tone], className)}>{children}</span>
}
