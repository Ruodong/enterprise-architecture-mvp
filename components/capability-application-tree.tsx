'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Network, Shuffle } from 'lucide-react'

type Direction = 'capability' | 'application'

type CapabilityNode = {
  id: string
  name: string
  applications: { id: string; name: string }[]
}

type ApplicationNode = {
  id: string
  name: string
  capabilities: { id: string; name: string }[]
}

export function CapabilityApplicationTree({
  capabilities,
  applications
}: {
  capabilities: CapabilityNode[]
  applications: ApplicationNode[]
}) {
  const [direction, setDirection] = useState<Direction>('capability')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const rootItems = useMemo(() => {
    return direction === 'capability' ? capabilities : applications
  }, [applications, capabilities, direction])

  const totalLinks = useMemo(
    () => capabilities.reduce((sum, item) => sum + item.applications.length, 0),
    [capabilities]
  )

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const expandAll = () => {
    const allKeys = new Set(rootItems.map((item) => `${direction}-${item.id}`))
    setExpanded(allKeys)
  }

  const collapseAll = () => setExpanded(new Set())

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="kpi-card">
          <p className="text-xs text-slate-500">能力总数</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{capabilities.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">应用总数</p>
          <p className="mt-1 text-2xl font-semibold">{applications.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">能力-应用关联</p>
          <p className="mt-1 text-2xl font-semibold text-sky-700">{totalLinks}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">当前视角</p>
          <p className="mt-1 text-base font-semibold">{direction === 'capability' ? '能力 → 应用' : '应用 → 能力'}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-3">
        <button
          onClick={() => {
            setDirection('capability')
            setExpanded(new Set())
          }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            direction === 'capability' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Network className="mr-1 inline h-4 w-4" /> 能力 → 应用
        </button>
        <button
          onClick={() => {
            setDirection('application')
            setExpanded(new Set())
          }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            direction === 'application' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Shuffle className="mr-1 inline h-4 w-4" /> 应用 → 能力
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />
        <button onClick={expandAll} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200">
          全部展开
        </button>
        <button onClick={collapseAll} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200">
          全部收起
        </button>
      </div>

      <div className="space-y-2">
        {rootItems.map((item) => {
          const key = `${direction}-${item.id}`
          const isOpen = expanded.has(key)
          const children = direction === 'capability' ? (item as CapabilityNode).applications : (item as ApplicationNode).capabilities

          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white/90">
              <button
                onClick={() => toggle(key)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <span className="font-medium text-slate-900">{item.name}</span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">关联 {children.length}</span>
              </button>

              {isOpen ? (
                <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-3">
                  {children.length === 0 ? (
                    <p className="text-sm text-slate-400">暂无关联</p>
                  ) : (
                    <ul className="space-y-1">
                      {children.map((child) => (
                        <li key={child.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                          {child.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
