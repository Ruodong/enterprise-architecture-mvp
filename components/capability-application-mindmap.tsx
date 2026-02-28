'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type CapNode = {
  id: string
  name: string
  level: number
  parentId: string | null
  applications: { id: string; name: string }[]
}

type AppNode = { id: string; name: string }

type PositionedNode = {
  id: string
  type: 'capability' | 'application'
  name: string
  x: number
  y: number
  width: number
  height: number
  level?: number
}

export function CapabilityApplicationMindmap({ capabilities, applications }: { capabilities: CapNode[]; applications: AppNode[] }) {
  const [selected, setSelected] = useState<{ id: string; type: 'capability' | 'application' } | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [last, setLast] = useState({ x: 0, y: 0 })

  const capabilityByLevel = useMemo(() => {
    return [1, 2, 3].map((lv) => capabilities.filter((c) => c.level === lv))
  }, [capabilities])

  const positioned = useMemo(() => {
    const nodes: PositionedNode[] = []
    const colX = [120, 420, 720]

    capabilityByLevel.forEach((list, idx) => {
      list.forEach((cap, i) => {
        nodes.push({
          id: cap.id,
          type: 'capability',
          name: cap.name,
          x: colX[idx],
          y: 80 + i * 88,
          width: 220,
          height: 52,
          level: cap.level
        })
      })
    })

    applications.forEach((app, i) => {
      nodes.push({
        id: app.id,
        type: 'application',
        name: app.name,
        x: 1060,
        y: 80 + i * 76,
        width: 220,
        height: 48
      })
    })

    return nodes
  }, [applications, capabilityByLevel])

  const nodeMap = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned])

  const hierarchyEdges = useMemo(() => {
    return capabilities
      .filter((c) => c.parentId)
      .map((c) => ({ from: c.parentId as string, to: c.id }))
      .filter((e) => nodeMap.has(e.from) && nodeMap.has(e.to))
  }, [capabilities, nodeMap])

  const capabilityAppEdges = useMemo(() => {
    const edges: Array<{ from: string; to: string }> = []
    capabilities.forEach((c) => c.applications.forEach((a) => edges.push({ from: c.id, to: a.id })))
    return edges.filter((e) => nodeMap.has(e.from) && nodeMap.has(e.to))
  }, [capabilities, nodeMap])

  const selectedDetail = useMemo(() => {
    if (!selected) return null
    if (selected.type === 'capability') {
      const cap = capabilities.find((c) => c.id === selected.id)
      if (!cap) return null
      return {
        title: `L${cap.level} 能力：${cap.name}`,
        links: cap.applications.map((a) => ({ href: `/applications/${a.id}`, label: a.name })),
        mainHref: `/capabilities/${cap.id}`,
        mainLabel: '打开能力详情'
      }
    }
    const app = applications.find((a) => a.id === selected.id)
    if (!app) return null
    const linkedCaps = capabilities.filter((c) => c.applications.some((a) => a.id === app.id))
    return {
      title: `应用：${app.name}`,
      links: linkedCaps.map((c) => ({ href: `/capabilities/${c.id}`, label: `L${c.level} · ${c.name}` })),
      mainHref: `/applications/${app.id}`,
      mainLabel: '打开应用详情'
    }
  }, [applications, capabilities, selected])

  const curvePath = (a: PositionedNode, b: PositionedNode) => {
    const x1 = a.x + a.width
    const y1 = a.y + a.height / 2
    const x2 = b.x
    const y2 = b.y + b.height / 2
    const cx1 = x1 + (x2 - x1) * 0.35
    const cx2 = x1 + (x2 - x1) * 0.65
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => setScale((v) => Math.min(1.8, Number((v + 0.1).toFixed(2))))} className="rounded bg-slate-100 px-2 py-1">放大</button>
          <button onClick={() => setScale((v) => Math.max(0.6, Number((v - 0.1).toFixed(2))))} className="rounded bg-slate-100 px-2 py-1">缩小</button>
          <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }} className="rounded bg-slate-100 px-2 py-1">重置视图</button>
          <span>可拖拽画布，点击节点联动右侧</span>
        </div>

        <svg
          viewBox="0 0 1320 980"
          className="h-[72vh] w-full cursor-grab rounded-xl bg-slate-50"
          onMouseDown={(e) => {
            setDragging(true)
            setLast({ x: e.clientX, y: e.clientY })
          }}
          onMouseMove={(e) => {
            if (!dragging) return
            const dx = e.clientX - last.x
            const dy = e.clientY - last.y
            setOffset((p) => ({ x: p.x + dx, y: p.y + dy }))
            setLast({ x: e.clientX, y: e.clientY })
          }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onWheel={(e) => {
            e.preventDefault()
            setScale((v) => Math.max(0.6, Math.min(1.8, Number((v + (e.deltaY > 0 ? -0.06 : 0.06)).toFixed(2)))))
          }}
        >
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {hierarchyEdges.map((edge) => {
              const from = nodeMap.get(edge.from)!
              const to = nodeMap.get(edge.to)!
              const active = selected && (selected.id === edge.from || selected.id === edge.to)
              return <path key={`h-${edge.from}-${edge.to}`} d={curvePath(from, to)} fill="none" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth={active ? 2.5 : 1.6} />
            })}

            {capabilityAppEdges.map((edge) => {
              const from = nodeMap.get(edge.from)!
              const to = nodeMap.get(edge.to)!
              const active = selected && (selected.id === edge.from || selected.id === edge.to)
              return <path key={`r-${edge.from}-${edge.to}`} d={curvePath(from, to)} fill="none" stroke={active ? '#0ea5e9' : '#cbd5e1'} strokeWidth={active ? 2.1 : 1.2} strokeDasharray="5 5" opacity={active ? 1 : 0.85} />
            })}

            {positioned.map((n) => {
              const isSelected = selected?.id === n.id
              const fill = n.type === 'capability' ? '#eff6ff' : '#f8fafc'
              const stroke = isSelected ? '#0284c7' : n.type === 'capability' ? '#93c5fd' : '#cbd5e1'
              return (
                <g key={n.id} onClick={() => setSelected({ id: n.id, type: n.type })} style={{ cursor: 'pointer' }}>
                  <rect x={n.x} y={n.y} width={n.width} height={n.height} rx={12} fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.2 : 1.4} />
                  <text x={n.x + 12} y={n.y + 23} fill="#0f172a" fontSize="12" fontWeight="600">{n.type === 'capability' ? `L${n.level}` : 'APP'}</text>
                  <text x={n.x + 12} y={n.y + 39} fill="#334155" fontSize="13">{n.name}</text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">图谱节点详情</h3>
        {!selectedDetail ? (
          <p className="mt-2 text-sm text-slate-500">点击图中节点后，这里显示关联信息与快捷跳转。</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-slate-900">{selectedDetail.title}</p>
            <Link href={selectedDetail.mainHref} className="inline-flex rounded bg-sky-100 px-2 py-1 text-xs text-sky-800 hover:bg-sky-200">{selectedDetail.mainLabel}</Link>
            <div>
              <p className="mb-1 text-xs text-slate-500">关联节点</p>
              {selectedDetail.links.length === 0 ? (
                <p className="text-sm text-slate-400">暂无</p>
              ) : (
                <ul className="space-y-1">
                  {selectedDetail.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="block rounded bg-slate-50 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
