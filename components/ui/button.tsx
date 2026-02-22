import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'link'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-700',
        variant === 'outline' && 'border border-slate-300 bg-white hover:bg-slate-100',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'link' && 'p-0 text-blue-600 underline-offset-4 hover:underline',
        className
      )}
      {...props}
    />
  )
}
