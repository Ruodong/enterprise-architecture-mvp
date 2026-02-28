'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

type CapNode = {
  id: string
  name: string
  level: number
  parentId: string | null
  diagramX?: number | null
  diagramY?: number | null
  applications: { id: string; name: string }[]
}

type Position = { x: number; y: number }

const VIEWBOX_WIDTH = 1600
const VIEWBOX_HEIGHT = 1080
const NODE_WIDTH = 300
const NODE_HEADER_HEIGHT = 54
const APP_BOX_HEIGHT = 24
const APP_BOX_GAP = 8
const NODE_INNER_GAP = 10

function nodeHeight(appCount: number) {
  const rows = Math.max(1, Math.ceil(appCount / 2))
  return NODE_HEADER_HEIGHT + NODE_INNER_GAP + rows * APP_BOX_HEIGHT + (rows - 1) * 6 + NODE_INNER_GAP
}

function polarToXY(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function autoRadialPositions(capabilities: CapNode[]): Record<string, Position> {
  const centerX = VIEWBOX_WIDTH / 2
  const centerY = VIEWBOX_HEIGHT / 2
  const r1 = 220
  const r2 = 390
  const r3 = 560

  const l1 = capabilities.filter((c) => c.level === 1).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  const byParent = new Map<string, CapNode[]>()
  capabilities.forEach((c) => {
    if (!c.parentId) return
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  })
  byParent.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')))

  const positions: Record<string, Position> = {}
  const l1Angles = new Map<string, number>()

  l1.forEach((node, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, l1.length)
    l1Angles.set(node.id, angle)
    const p = polarToXY(centerX, centerY, r1, angle)
    positions[node.id] = { x: p.x - NODE_WIDTH / 2, y: p.y - nodeHeight(node.applications.length) / 2 }
  })

  l1.forEach((parent) => {
    const childrenL2 = byParent.get(parent.id) ?? []
    const base = l1Angles.get(parent.id) ?? -Math.PI / 2
    const span = Math.PI / 3

    childrenL2.forEach((child, idx) => {
      const ratio = childrenL2.length === 1 ? 0.5 : idx / (childrenL2.length - 1)
      const angle = base - span / 2 + span * ratio
      const p = polarToXY(centerX, centerY, r2, angle)
      positions[child.id] = { x: p.x - NODE_WIDTH / 2, y: p.y - nodeHeight(child.applications.length) / 2 }

      const childrenL3 = byParent.get(child.id) ?? []
      const spanL3 = Math.PI / 4
      childrenL3.forEach((leaf, leafIdx) => {
        const ratioL3 = childrenL3.length === 1 ? 0.5 : leafIdx / (childrenL3.length - 1)
        const angleL3 = angle - spanL3 / 2 + spanL3 * ratioL3
        const p3 = polarToXY(centerX, centerY, r3, angleL3)
        positions[leaf.id] = { x: p3.x - NODE_WIDTH / 2, y: p3.y - nodeHeight(leaf.applications.length) / 2 }
      })
    })
  })

  return positions
}

export function CapabilityApplicationMindmap({ capabilities }: { capabilities: CapNode[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const byParent = useMemo(() => {
    const map = new Map<string, CapNode[]>()
    capabilities.forEach((c) => {
      if (!c.parentId) return
      const list = map.get(c.parentId) ?? []
      list.push(c)
      map.set(c.parentId, list)
    })
    return map
  }, [capabilities])

  const autoLayout = useMemo(() => autoRadialPositions(capabilities), [capabilities])

  const persistedPositions = useMemo<Record<string, Position>>(() => {
    const merged: Record<string, Position> = { ...autoLayout }
    capabilities.forEach((cap) => {
      if (typeof cap.diagramX === 'number' && typeof cap.diagramY === 'number') {
        merged[cap.id] = { x: cap.diagramX, y: cap.diagramY }
      }
    })
    return merged
  }, [autoLayout, capabilities])

  const [positions, setPositions] = useState<Record<string, Position>>(persistedPositions)

  const visibility = useMemo(() => {
    const hidden = new Set<string>()
    const walkHide = (id: string) => {
      const children = byParent.get(id) ?? []
      children.forEach((child) => {
        hidden.add(child.id)
        walkHide(child.id)
      })
    }
    collapsed.forEach((id) => walkHide(id))
    return { hidden }
  }, [byParent, collapsed])

  const nodes = useMemo(() => {
    return capabilities
      .filter((c) => !visibility.hidden.has(c.id))
      .map((c) => ({
        ...c,
        x: positions[c.id]?.x ?? autoLayout[c.id]?.x ?? 0,
        y: positions[c.id]?.y ?? autoLayout[c.id]?.y ?? 0,
        width: NODE_WIDTH,
        height: nodeHeight(c.applications.length)
      }))
  }, [capabilities, positions, autoLayout, visibility.hidden])

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const hierarchyEdges = useMemo(
    () =>
      nodes
        .filter((n) => n.parentId)
        .map((n) => ({ from: n.parentId as string, to: n.id }))
        .filter((e) => nodeMap.has(e.from) && nodeMap.has(e.to)),
    [nodeMap, nodes]
  )

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null

  const centerX = VIEWBOX_WIDTH / 2
  const centerY = VIEWBOX_HEIGHT / 2

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: clientX, y: clientY }
    const rect = svg.getBoundingClientRect()
    const rawX = ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH
    const rawY = ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT
    return {
      x: (rawX - centerX) / scale + centerX,
      y: (rawY - centerY) / scale + centerY
    }
  }

  const savePosition = async (id: string) => {
    const p = positions[id]
    if (!p) return
    try {
      await fetch('/api/capability-positions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, x: p.x, y: p.y })
      })
    } catch {
      // noop
    }
  }

  const resetToLenovoMap = async () => {
    setPositions(autoLayout)
    setScale(1)
    await Promise.all(
      capabilities.map((c) => {
        const p = autoLayout[c.id]
        return fetch('/api/capability-positions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: c.id, x: p.x, y: p.y })
        }).catch(() => undefined)
      })
    )
  }

  const curvePath = (fromId: string, toId: string) => {
    const from = nodeMap.get(fromId)
    const to = nodeMap.get(toId)
    if (!from || !to) return ''
    const x1 = from.x + from.width / 2
    const y1 = from.y + from.height / 2
    const x2 = to.x + to.width / 2
    const y2 = to.y + to.height / 2
    const cx1 = x1 + (x2 - x1) * 0.35
    const cy1 = y1 + (y2 - y1) * 0.15
    const cx2 = x1 + (x2 - x1) * 0.65
    const cy2 = y1 + (y2 - y1) * 0.85
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
  }

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Lenovo Business Capability Map · 支持缩放、拖拽，L1/L2 节点可折叠下级。</span>
          <button onClick={() => void resetToLenovoMap()} className="rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200">重置布局</button>
        </div>

        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="h-[78vh] w-full rounded-xl bg-slate-50"
            onWheel={(e) => {
              e.preventDefault()
              const delta = e.deltaY > 0 ? -0.08 : 0.08
              setScale((v) => Math.max(0.55, Math.min(1.8, Number((v + delta).toFixed(2)))))
            }}
            onMouseMove={(e) => {
              if (!dragging) return
              const p = toSvgPoint(e.clientX, e.clientY)
              const dx = p.x - dragging.x
              const dy = p.y - dragging.y
              setPositions((prev) => ({
                ...prev,
                [dragging.id]: {
                  x: (prev[dragging.id]?.x ?? 0) + dx,
                  y: (prev[dragging.id]?.y ?? 0) + dy
                }
              }))
              setDragging({ id: dragging.id, x: p.x, y: p.y })
            }}
            onMouseUp={() => {
              if (dragging?.id) void savePosition(dragging.id)
              setDragging(null)
            }}
            onMouseLeave={() => {
              if (dragging?.id) void savePosition(dragging.id)
              setDragging(null)
            }}
          >
            <g transform={`translate(${centerX * (1 - scale)} ${centerY * (1 - scale)}) scale(${scale})`}>
              <circle cx={centerX} cy={centerY} r={120} fill="#ffffff" stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x={centerX} y={centerY - 6} textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="700">
                Lenovo Business
              </text>
              <text x={centerX} y={centerY + 14} textAnchor="middle" fill="#334155" fontSize="14" fontWeight="600">
                Capability Map
              </text>

              {hierarchyEdges.map((edge) => {
                const active = selectedId && (selectedId === edge.from || selectedId === edge.to)
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={curvePath(edge.from, edge.to)}
                    fill="none"
                    stroke={active ? '#93c5fd' : '#dbeafe'}
                    strokeWidth={active ? 2.6 : 1.8}
                  />
                )
              })}

              {nodes.map((n) => {
                const appBoxWidth = (NODE_WIDTH - NODE_INNER_GAP * 3) / 2
                const isSelected = selectedId === n.id
                const canToggle = n.level === 1 || n.level === 2
                const hasChildren = (byParent.get(n.id)?.length ?? 0) > 0
                const isCollapsed = collapsed.has(n.id)

                return (
                  <g
                    key={n.id}
                    onMouseDown={(e) => {
                      const target = e.target as SVGElement
                      if (target.dataset.role === 'collapse') return
                      const p = toSvgPoint(e.clientX, e.clientY)
                      setDragging({ id: n.id, x: p.x, y: p.y })
                      setSelectedId(n.id)
                    }}
                    style={{ cursor: dragging?.id === n.id ? 'grabbing' : 'grab' }}
                  >
                    <rect
                      x={n.x}
                      y={n.y}
                      width={n.width}
                      height={n.height}
                      rx={14}
                      fill={isSelected ? '#eff6ff' : '#ffffff'}
                      stroke={isSelected ? '#0284c7' : '#cbd5e1'}
                      strokeWidth={isSelected ? 2.2 : 1.4}
                    />
                    <text x={n.x + 12} y={n.y + 22} fill="#0f172a" fontSize="12" fontWeight="700">{`L${n.level}`}</text>
                    <text x={n.x + 12} y={n.y + 40} fill="#0f172a" fontSize="14" fontWeight="600">{n.name}</text>

                    {canToggle && hasChildren ? (
                      <g onClick={() => toggleCollapse(n.id)}>
                        <rect
                          data-role="collapse"
                          x={n.x + n.width - 28}
                          y={n.y + 10}
                          width={18}
                          height={18}
                          rx={6}
                          fill="#f1f5f9"
                          stroke="#cbd5e1"
                        />
                        <text
                          data-role="collapse"
                          x={n.x + n.width - 19}
                          y={n.y + 23}
                          textAnchor="middle"
                          fontSize="14"
                          fill="#334155"
                          style={{ pointerEvents: 'none' }}
                        >
                          {isCollapsed ? '+' : '-'}
                        </text>
                      </g>
                    ) : null}

                    {n.applications.map((app, idx) => {
                      const row = Math.floor(idx / 2)
                      const col = idx % 2
                      const x = n.x + NODE_INNER_GAP + col * (appBoxWidth + APP_BOX_GAP)
                      const y = n.y + NODE_HEADER_HEIGHT + NODE_INNER_GAP + row * (APP_BOX_HEIGHT + 6)
                      return (
                        <g key={app.id}>
                          <rect x={x} y={y} width={appBoxWidth} height={APP_BOX_HEIGHT} rx={8} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1} />
                          <text x={x + 8} y={y + 16} fill="#334155" fontSize="11">{app.name}</text>
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </g>
          </svg>

          <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <button
              onClick={() => setScale((v) => Math.min(1.8, Number((v + 0.1).toFixed(2))))}
              className="h-8 w-8 border-b border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              +
            </button>
            <button
              onClick={() => setScale((v) => Math.max(0.55, Number((v - 0.1).toFixed(2))))}
              className="h-8 w-8 text-slate-700 hover:bg-slate-50"
            >
              −
            </button>
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">能力节点详情</h3>
        {!selected ? (
          <p className="mt-2 text-sm text-slate-500">点击/拖动图中能力节点后，这里显示详情。</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-medium text-slate-900">{`L${selected.level} · ${selected.name}`}</p>
            <Link href={`/capabilities/${selected.id}`} className="inline-flex rounded bg-sky-100 px-2 py-1 text-xs text-sky-800 hover:bg-sky-200">
              打开能力详情
            </Link>
            <div>
              <p className="mb-1 text-xs text-slate-500">实现应用</p>
              {selected.applications.length === 0 ? (
                <p className="text-sm text-slate-400">暂无</p>
              ) : (
                <ul className="space-y-1">
                  {selected.applications.map((app) => (
                    <li key={app.id}>
                      <Link href={`/applications/${app.id}`} className="block rounded bg-slate-50 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100">
                        {app.name}
                      </Link>
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
