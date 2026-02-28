'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight, Network, Shuffle } from 'lucide-react'

type Direction = 'capability' | 'application'
type NodeType = 'capability' | 'application'

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

type SelectedNode = { type: NodeType; id: string } | null

export function CapabilityApplicationTree({
  capabilities,
  applications
}: {
  capabilities: CapabilityNode[]
  applications: ApplicationNode[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [direction, setDirection] = useState<Direction>('capability')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<SelectedNode>(null)

  useEffect(() => {
    const urlDirection = searchParams.get('direction')
    const urlNodeType = searchParams.get('nodeType')
    const urlNodeId = searchParams.get('nodeId')

    if (urlDirection === 'capability' || urlDirection === 'application') {
      setDirection(urlDirection)
    }

    if ((urlNodeType === 'capability' || urlNodeType === 'application') && urlNodeId) {
      setSelected({ type: urlNodeType, id: urlNodeId })
    }
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('direction', direction)

    if (selected) {
      params.set('nodeType', selected.type)
      params.set('nodeId', selected.id)
    } else {
      params.delete('nodeType')
      params.delete('nodeId')
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [direction, selected, pathname, router, searchParams])

  const capabilityMap = useMemo(() => new Map(capabilities.map((x) => [x.id, x])), [capabilities])
  const applicationMap = useMemo(() => new Map(applications.map((x) => [x.id, x])), [applications])

  const rootItems = useMemo(() => {
    return direction === 'capability' ? capabilities : applications
  }, [applications, capabilities, direction])

  const totalLinks = useMemo(
    () => capabilities.reduce((sum, item) => sum + item.applications.length, 0),
    [capabilities]
  )

  const selectedDetail = useMemo(() => {
    if (!selected) return null
    if (selected.type === 'capability') {
      const node = capabilityMap.get(selected.id)
      if (!node) return null
      return {
        title: `能力：${node.name}`,
        subtitle: `关联应用 ${node.applications.length}`,
        relationLabel: '关联应用',
        relations: node.applications
      }
    }

    const node = applicationMap.get(selected.id)
    if (!node) return null
    return {
      title: `应用：${node.name}`,
      subtitle: `关联能力 ${node.capabilities.length}`,
      relationLabel: '关联能力',
      relations: node.capabilities
    }
  }, [applicationMap, capabilityMap, selected])

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

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {rootItems.map((item) => {
            const key = `${direction}-${item.id}`
            const isOpen = expanded.has(key)
            const isSelectedRoot = selected?.type === direction && selected.id === item.id
            const children = direction === 'capability' ? (item as CapabilityNode).applications : (item as ApplicationNode).capabilities

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white/90">
                <button
                  onClick={() => {
                    toggle(key)
                    setSelected({ type: direction, id: item.id })
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 ${
                    isSelectedRoot ? 'bg-sky-50' : ''
                  }`}
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
                        {children.map((child) => {
                          const childType: NodeType = direction === 'capability' ? 'application' : 'capability'
                          const isSelectedChild = selected?.type === childType && selected.id === child.id
                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => setSelected({ type: childType, id: child.id })}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-100 ${
                                  isSelectedChild ? 'bg-sky-100/70 text-sky-900' : ''
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                                {child.name}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white/90 p-4">
          <h3 className="text-sm font-semibold text-slate-900">节点详情</h3>
          {!selectedDetail ? (
            <p className="mt-2 text-sm text-slate-500">点击左侧任意节点后，这里会显示关联详情。</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedDetail.title}</p>
                <p className="text-xs text-slate-500">{selectedDetail.subtitle}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{selectedDetail.relationLabel}</p>
                {selectedDetail.relations.length === 0 ? (
                  <p className="text-sm text-slate-400">暂无</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedDetail.relations.map((item) => (
                      <li key={item.id} className="rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
