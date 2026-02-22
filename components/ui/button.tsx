import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'link'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'bg-slate-900 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_10px_20px_rgba(15,23,42,0.18)] hover:bg-slate-800',
        variant === 'outline' && 'border border-slate-200 bg-white/90 text-slate-700 hover:bg-white',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'link' && 'p-0 text-sky-700 underline-offset-4 hover:underline',
        className
      )}
      {...props}
    />
  )
}
