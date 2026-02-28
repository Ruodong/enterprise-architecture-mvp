'use client'

import { useEffect, useState } from 'react'
import { AppWindowMac, Minus, Plus } from 'lucide-react'
import { AppNav } from '@/components/app-nav'

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ea.navHidden')
    if (saved === '1') setNavHidden(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('ea.navHidden', navHidden ? '1' : '0')
  }, [navHidden])

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-6 md:py-6">
      <header className="panel mb-4 flex items-center justify-between px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/80">
            <AppWindowMac className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Enterprise Architecture</p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">企业架构管理控制台</h1>
          </div>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 md:block">macOS-style MVP</div>
      </header>

      <div className={`grid gap-4 ${navHidden ? 'md:grid-cols-1' : 'md:grid-cols-[255px_1fr]'}`}>
        {!navHidden ? (
          <aside className="panel h-fit p-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Navigation</p>
              <button
                onClick={() => setNavHidden(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                title="隐藏 Navigation"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
            <AppNav />
          </aside>
        ) : null}

        <main>
          {navHidden ? (
            <div className="mb-2">
              <button
                onClick={() => setNavHidden(false)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                title="显示 Navigation"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}
