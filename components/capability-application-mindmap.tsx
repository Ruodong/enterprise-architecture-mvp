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

const VIEWBOX_WIDTH = 1500
const VIEWBOX_HEIGHT = 980
const NODE_WIDTH = 320
const NODE_HEADER_HEIGHT = 56
const APP_BOX_HEIGHT = 24
const APP_BOX_GAP = 8
const NODE_INNER_GAP = 10

function nodeHeight(appCount: number) {
  const rows = Math.max(1, Math.ceil(appCount / 2))
  return NODE_HEADER_HEIGHT + NODE_INNER_GAP + rows * APP_BOX_HEIGHT + (rows - 1) * 6 + NODE_INNER_GAP
}

export function CapabilityApplicationMindmap({ capabilities }: { capabilities: CapNode[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null)

  const initialPositions = useMemo<Record<string, Position>>(() => {
    const grouped = [1, 2, 3].map((lv) => capabilities.filter((c) => c.level === lv))
    const colX = [80, 560, 1040]
    const map: Record<string, Position> = {}

    grouped.forEach((list, idx) => {
      let cursorY = 80
      list.forEach((cap) => {
        map[cap.id] = {
          x: typeof cap.diagramX === 'number' ? cap.diagramX : colX[idx],
          y: typeof cap.diagramY === 'number' ? cap.diagramY : cursorY
        }
        cursorY += nodeHeight(cap.applications.length) + 26
      })
    })

    return map
  }, [capabilities])

  const [positions, setPositions] = useState<Record<string, Position>>(initialPositions)

  const nodes = useMemo(() => {
    return capabilities.map((c) => ({
      ...c,
      x: positions[c.id]?.x ?? 0,
      y: positions[c.id]?.y ?? 0,
      width: NODE_WIDTH,
      height: nodeHeight(c.applications.length)
    }))
  }, [capabilities, positions])

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const hierarchyEdges = useMemo(
    () => nodes.filter((n) => n.parentId).map((n) => ({ from: n.parentId as string, to: n.id })).filter((e) => nodeMap.has(e.from)),
    [nodeMap, nodes]
  )

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: clientX, y: clientY }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
      y: ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT
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
      // no-op
    }
  }

  const curvePath = (fromId: string, toId: string) => {
    const from = nodeMap.get(fromId)
    const to = nodeMap.get(toId)
    if (!from || !to) return ''
    const x1 = from.x + from.width
    const y1 = from.y + from.height / 2
    const x2 = to.x
    const y2 = to.y + to.height / 2
    const cx1 = x1 + (x2 - x1) * 0.35
    const cx2 = x1 + (x2 - x1) * 0.65
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 text-xs text-slate-500">提示：拖动任意能力节点可自由调整布局。浅色连线表示 L1 → L2 → L3 层级关系。</div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-[74vh] w-full rounded-xl bg-slate-50"
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
          {hierarchyEdges.map((edge) => {
            const active = selectedId && (selectedId === edge.from || selectedId === edge.to)
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={curvePath(edge.from, edge.to)}
                fill="none"
                stroke={active ? '#7dd3fc' : '#cbd5e1'}
                strokeWidth={active ? 2.4 : 1.5}
              />
            )
          })}

          {nodes.map((n) => {
            const appBoxWidth = (NODE_WIDTH - NODE_INNER_GAP * 3) / 2
            const isSelected = selectedId === n.id

            return (
              <g
                key={n.id}
                onMouseDown={(e) => {
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

                {n.applications.map((app, idx) => {
                  const row = Math.floor(idx / 2)
                  const col = idx % 2
                  const x = n.x + NODE_INNER_GAP + col * (appBoxWidth + NODE_INNER_GAP)
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
        </svg>
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
