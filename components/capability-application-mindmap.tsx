'use client'

import Link from 'next/link'
import { GitBranch, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type CapNode = {
  id: string
  name: string
  level: number
  parentId: string | null
  diagramX?: number | null
  diagramY?: number | null
  appCount?: number
  applications: { id: string; name: string }[]
}

type Position = { x: number; y: number }

const VIEWBOX_WIDTH = 2200
const VIEWBOX_HEIGHT = 1400
const NODE_WIDTH = 300
const NODE_HEADER_HEIGHT = 54
const APP_BOX_HEIGHT = 28
const APP_BOX_GAP = 8
const NODE_INNER_GAP = 10

const appGroupPalette: Record<string, { fill: string; stroke: string; text: string; mutedFill: string; mutedStroke: string; mutedText: string }> = {
  销售域: { fill: '#bfdbfe', stroke: '#3b82f6', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' },
  供应链域: { fill: '#a5f3fc', stroke: '#06b6d4', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' },
  财务域: { fill: '#ddd6fe', stroke: '#8b5cf6', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' },
  人力域: { fill: '#fed7aa', stroke: '#f97316', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' },
  平台域: { fill: '#bbf7d0', stroke: '#22c55e', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' },
  其他: { fill: '#cbd5e1', stroke: '#64748b', text: '#111827', mutedFill: '#f1f5f9', mutedStroke: '#cbd5e1', mutedText: '#94a3b8' }
}

const DOMAIN_GROUPS = ['销售域', '供应链域', '财务域', '人力域', '平台域'] as const

function getAppGroup(name: string) {
  if (name.includes('CRM') || name.includes('销售')) return '销售域'
  if (name.includes('订单') || name.includes('采购')) return '供应链域'
  if (name.includes('财务') || name.includes('BI')) return '财务域'
  if (name.includes('HR') || name.includes('人力')) return '人力域'
  if (name.includes('IAM') || name.includes('API') || name.includes('中台') || name.includes('可观测')) return '平台域'
  return '其他'
}

function fitAppLabel(name: string, maxChars = 8) {
  return name.length > maxChars ? `${name.slice(0, maxChars)}…` : name
}

function nodeHeight(appCount: number) {
  const rows = Math.max(1, Math.ceil(appCount / 2))
  return NODE_HEADER_HEIGHT + NODE_INNER_GAP + rows * APP_BOX_HEIGHT + (rows - 1) * 6 + NODE_INNER_GAP
}

function polarToXY(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function rectAnchorToward(node: { x: number; y: number; width: number; height: number }, tx: number, ty: number) {
  const cx = node.x + node.width / 2
  const cy = node.y + node.height / 2
  const dx = tx - cx
  const dy = ty - cy
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx > absDy) {
    return { x: cx + Math.sign(dx || 1) * (node.width / 2), y: cy + (dy / (absDx || 1)) * (node.width / 2) }
  }
  return { x: cx + (dx / (absDy || 1)) * (node.height / 2), y: cy + Math.sign(dy || 1) * (node.height / 2) }
}

function nudgePoint(ax: number, ay: number, tx: number, ty: number, d = 2) {
  const vx = tx - ax
  const vy = ty - ay
  const len = Math.hypot(vx, vy) || 1
  return { x: ax + (vx / len) * d, y: ay + (vy / len) * d }
}

function autoRadialPositions(capabilities: CapNode[]): Record<string, Position> {
  const centerX = VIEWBOX_WIDTH / 2
  const centerY = VIEWBOX_HEIGHT / 2
  const r1 = 320
  const r2 = 700
  const r3 = 1020

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

  // 给每个L1分配不重叠扇区，L2/L3只在各自扇区扩散，降低交叉与重叠
  const total = Math.max(1, l1.length)
  const sectorSpan = (Math.PI * 2) / total

  l1.forEach((node, i) => {
    const angle = -Math.PI / 2 + i * sectorSpan
    l1Angles.set(node.id, angle)
    const p = polarToXY(centerX, centerY, r1, angle)
    positions[node.id] = { x: p.x - NODE_WIDTH / 2, y: p.y - nodeHeight(node.applications.length) / 2 }
  })

  l1.forEach((parent, i) => {
    const childrenL2 = byParent.get(parent.id) ?? []
    const base = l1Angles.get(parent.id) ?? -Math.PI / 2
    const span = Math.min(sectorSpan * 0.78, Math.PI / 2.2)

    childrenL2.forEach((child, idx) => {
      const ratio = childrenL2.length === 1 ? 0.5 : idx / (childrenL2.length - 1)
      const angle = base - span / 2 + span * ratio
      const p = polarToXY(centerX, centerY, r2, angle)
      positions[child.id] = { x: p.x - NODE_WIDTH / 2, y: p.y - nodeHeight(child.applications.length) / 2 }

      const childrenL3 = byParent.get(child.id) ?? []
      const spanL3 = Math.min(span * 0.62, Math.PI / 3)
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

function autoTreePositions(capabilities: CapNode[]): Record<string, Position> {
  const levelX: Record<number, number> = { 1: 280, 2: 760, 3: 1240 }
  const verticalGap = 36
  const byParent = new Map<string, CapNode[]>()
  capabilities.forEach((c) => {
    if (!c.parentId) return
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  })
  byParent.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')))

  const roots = capabilities.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  const positions: Record<string, Position> = {}
  let cursorY = 120

  const layout = (node: CapNode): number => {
    const children = byParent.get(node.id) ?? []
    const h = nodeHeight(node.applications.length)

    if (children.length === 0) {
      const centerY = cursorY + h / 2
      positions[node.id] = { x: (levelX[node.level] ?? 1240) - NODE_WIDTH / 2, y: centerY - h / 2 }
      cursorY += h + verticalGap
      return centerY
    }

    const childCenters = children.map((child) => layout(child))
    const minY = Math.min(...childCenters)
    const maxY = Math.max(...childCenters)
    const centerY = (minY + maxY) / 2
    positions[node.id] = { x: (levelX[node.level] ?? 1240) - NODE_WIDTH / 2, y: centerY - h / 2 }
    return centerY
  }

  roots.forEach((root) => {
    layout(root)
    cursorY += 24
  })

  return positions
}

export function CapabilityApplicationMindmap({ capabilities }: { capabilities: CapNode[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null)
  const [layoutMode, setLayoutMode] = useState<'star' | 'tree'>('star')
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [canvasDragging, setCanvasDragging] = useState<{ x: number; y: number } | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [detailHidden, setDetailHidden] = useState(false)
  const [highlightMultiApps, setHighlightMultiApps] = useState(false)
  const [mutedDomains, setMutedDomains] = useState<Set<string>>(new Set())
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickDomainRef = useRef<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('ea.detailHidden')
    if (saved === '1') setDetailHidden(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('ea.detailHidden', detailHidden ? '1' : '0')
  }, [detailHidden])

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

  const autoLayout = useMemo(
    () => (layoutMode === 'star' ? autoRadialPositions(capabilities) : autoTreePositions(capabilities)),
    [capabilities, layoutMode]
  )

  const [positions, setPositions] = useState<Record<string, Position>>(autoLayout)

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

  const l1Nodes = useMemo(() => nodes.filter((n) => n.level === 1), [nodes])

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null

  const centerX = layoutMode === 'star' ? VIEWBOX_WIDTH / 2 : 80
  const centerY = VIEWBOX_HEIGHT / 2

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: clientX, y: clientY }
    const rect = svg.getBoundingClientRect()
    const rawX = ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH
    const rawY = ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT
    return {
      x: (rawX - centerX - pan.x) / scale + centerX,
      y: (rawY - centerY - pan.y) / scale + centerY
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

  const applyLayout = async (mode: 'star' | 'tree') => {
    setLayoutMode(mode)
    const nextLayout = mode === 'star' ? autoRadialPositions(capabilities) : autoTreePositions(capabilities)
    setPositions(nextLayout)
    setScale(1)
    setPan({ x: 0, y: 0 })
    await Promise.all(
      capabilities.map((c) => {
        const p = nextLayout[c.id]
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

    if (layoutMode === 'tree') {
      const x1 = from.x + from.width
      const y1 = from.y + from.height / 2
      const x2 = to.x
      const y2 = to.y + to.height / 2
      const p1 = nudgePoint(x1, y1, x2, y2, 2)
      const p2 = nudgePoint(x2, y2, x1, y1, 2)
      const midX = p1.x + (p2.x - p1.x) * 0.45
      return `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`
    }

    const fromCenterX = from.x + from.width / 2
    const fromCenterY = from.y + from.height / 2
    const toCenterX = to.x + to.width / 2
    const toCenterY = to.y + to.height / 2
    const p1Raw = rectAnchorToward(from, toCenterX, toCenterY)
    const p2Raw = rectAnchorToward(to, fromCenterX, fromCenterY)
    const p1 = nudgePoint(p1Raw.x, p1Raw.y, p2Raw.x, p2Raw.y, 2)
    const p2 = nudgePoint(p2Raw.x, p2Raw.y, p1Raw.x, p1Raw.y, 2)
    const cx1 = p1.x + (p2.x - p1.x) * 0.35
    const cy1 = p1.y + (p2.y - p1.y) * 0.15
    const cx2 = p1.x + (p2.x - p1.x) * 0.65
    const cy2 = p1.y + (p2.y - p1.y) * 0.85
    return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`
  }

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleDomain = (domain: string) => {
    setMutedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  const focusDomain = (domain: string) => {
    const hasAnyMuted = mutedDomains.size > 0
    if (hasAnyMuted) {
      setMutedDomains(new Set())
      return
    }
    const allOther = DOMAIN_GROUPS.filter((d) => d !== domain)
    setMutedDomains(new Set(allOther))
  }

  const handleDomainButtonClick = (domain: string) => {
    if (clickTimerRef.current && clickDomainRef.current === domain) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      clickDomainRef.current = null
      focusDomain(domain)
      return
    }

    clickDomainRef.current = domain
    clickTimerRef.current = setTimeout(() => {
      toggleDomain(domain)
      clickTimerRef.current = null
      clickDomainRef.current = null
    }, 220)
  }

  const nodeMutedMap = new Map<string, boolean>()
  nodes.forEach((n) => {
    const domains = Array.from(new Set(n.applications.map((a) => getAppGroup(a.name)).filter((g) => g !== '其他')))
    const muted = domains.length > 0 && domains.every((d) => mutedDomains.has(d))
    nodeMutedMap.set(n.id, muted)
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Lenovo Business Capability Map · 支持拖拽，L1/L2 节点可折叠下级。</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void applyLayout('star')}
              className={`inline-flex h-7 w-7 items-center justify-center rounded border ${layoutMode === 'star' ? 'border-sky-300 bg-sky-100 text-sky-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
              title="星型布局"
            >
              <Star className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => void applyLayout('tree')}
              className={`inline-flex h-7 w-7 items-center justify-center rounded border ${layoutMode === 'tree' ? 'border-sky-300 bg-sky-100 text-sky-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
              title="树形布局"
            >
              <GitBranch className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          {DOMAIN_GROUPS.map((group) => {
            const p = appGroupPalette[group]
            const isMuted = mutedDomains.has(group)
            return (
              <button
                key={group}
                type="button"
                onClick={() => handleDomainButtonClick(group)}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
                style={{
                  borderColor: isMuted ? p.mutedStroke : p.stroke,
                  background: isMuted ? p.mutedFill : p.fill,
                  color: isMuted ? p.mutedText : p.text
                }}
              >
                {group}
              </button>
            )
          })}
          <label className="ml-auto inline-flex items-center gap-1.5 px-1 py-0.5 text-[11px] text-slate-700">
            <input
              type="checkbox"
              checked={highlightMultiApps}
              onChange={(e) => setHighlightMultiApps(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            L2/L3业务能力多应用
          </label>
        </div>

        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="h-[78vh] w-full rounded-xl bg-slate-50"
            onMouseDown={(e) => {
              const target = e.target as Element
              const inNode = !!target.closest('[data-role="node-root"]')
              if (inNode) return
              setCanvasDragging({ x: e.clientX, y: e.clientY })
            }}
            onMouseMove={(e) => {
              if (dragging) {
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
                return
              }

              if (canvasDragging) {
                const dx = ((e.clientX - canvasDragging.x) / (svgRef.current?.clientWidth || 1)) * VIEWBOX_WIDTH
                const dy = ((e.clientY - canvasDragging.y) / (svgRef.current?.clientHeight || 1)) * VIEWBOX_HEIGHT
                setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
                setCanvasDragging({ x: e.clientX, y: e.clientY })
              }
            }}
            onMouseUp={() => {
              if (dragging?.id) void savePosition(dragging.id)
              setDragging(null)
              setCanvasDragging(null)
            }}
            onMouseLeave={() => {
              if (dragging?.id) void savePosition(dragging.id)
              setDragging(null)
              setCanvasDragging(null)
            }}
          >
            <g transform={`translate(${pan.x + centerX * (1 - scale)} ${pan.y + centerY * (1 - scale)}) scale(${scale})`}>
              {l1Nodes.map((n) => {
                const active = selectedId === n.id
                const muted = nodeMutedMap.get(n.id)
                const stroke = active ? '#7dd3fc' : muted ? '#e2e8f0' : '#cbd5e1'
                const strokeWidth = active ? 2.4 : 1.4

                if (layoutMode === 'tree') {
                  const x1 = centerX + 11
                  const y1 = centerY
                  const x2 = n.x
                  const y2 = n.y + n.height / 2
                  const midX = x1 + (x2 - x1) * 0.45
                  return (
                    <path
                      key={`center-${n.id}`}
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                    />
                  )
                }

                const anchorRaw = rectAnchorToward(n, centerX, centerY)
                const anchor = nudgePoint(anchorRaw.x, anchorRaw.y, centerX, centerY, 2)
                const cx = centerX + (anchor.x - centerX) * 0.42
                const cy = centerY + (anchor.y - centerY) * 0.58
                return (
                  <path
                    key={`center-${n.id}`}
                    d={`M ${centerX} ${centerY} Q ${cx} ${cy}, ${anchor.x} ${anchor.y}`}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                )
              })}

              {hierarchyEdges.map((edge) => {
                const active = selectedId && (selectedId === edge.from || selectedId === edge.to)
                const muted = nodeMutedMap.get(edge.from) && nodeMutedMap.get(edge.to)
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={curvePath(edge.from, edge.to)}
                    fill="none"
                    stroke={active ? '#93c5fd' : muted ? '#e5e7eb' : '#dbeafe'}
                    strokeWidth={active ? 2.6 : 1.8}
                  />
                )
              })}

              <circle cx={centerX} cy={centerY} r={11} fill="#ffffff" stroke="#94a3b8" strokeWidth={2} />

              {nodes.map((n) => {
                const appBoxWidth = (NODE_WIDTH - NODE_INNER_GAP * 3) / 2
                const isSelected = selectedId === n.id
                const isMutedNode = nodeMutedMap.get(n.id)
                const canToggle = n.level === 1 || n.level === 2
                const hasChildren = (byParent.get(n.id)?.length ?? 0) > 0
                const isCollapsed = collapsed.has(n.id)

                return (
                  <g
                    key={n.id}
                    data-role="node-root"
                    onMouseDown={(e) => {
                      const target = e.target as SVGElement
                      const role = target.dataset.role || target.parentElement?.getAttribute('data-role') || ''
                      if (role.startsWith('collapse')) return
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
                      fill={isSelected ? '#eff6ff' : isMutedNode ? '#f8fafc' : '#ffffff'}
                      stroke={isSelected ? '#0284c7' : isMutedNode ? '#e2e8f0' : '#cbd5e1'}
                      strokeWidth={isSelected ? 2.2 : 1.4}
                    />
                    <text x={n.x + 12} y={n.y + 22} fill={isMutedNode ? '#94a3b8' : '#0f172a'} fontSize="12" fontWeight="700">{`L${n.level}`}</text>
                    <text x={n.x + 12} y={n.y + 40} fill={isMutedNode ? '#94a3b8' : '#0f172a'} fontSize="14" fontWeight="600">{n.name}</text>

                    {canToggle && hasChildren ? (
                      <g style={{ cursor: 'pointer' }} data-role="collapse-group">
                        <rect
                          data-role="collapse-rect"
                          x={n.x + n.width - 28}
                          y={n.y + 10}
                          width={18}
                          height={18}
                          rx={6}
                          fill="#f1f5f9"
                          stroke="#cbd5e1"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleCollapse(n.id)
                          }}
                        />
                        <text
                          data-role="collapse-text"
                          x={n.x + n.width - 19}
                          y={n.y + 23}
                          textAnchor="middle"
                          fontSize="14"
                          fill="#334155"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleCollapse(n.id)
                          }}
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
                      const group = getAppGroup(app.name)
                      const palette = appGroupPalette[group] ?? appGroupPalette['其他']
                      const domainMuted = group !== '其他' && mutedDomains.has(group)
                      const emphasize = highlightMultiApps && (n.appCount ?? n.applications.length) > 1
                      return (
                        <g key={app.id}>
                          <rect
                            x={x}
                            y={y}
                            width={appBoxWidth}
                            height={APP_BOX_HEIGHT}
                            rx={8}
                            fill={domainMuted ? palette.mutedFill : palette.fill}
                            stroke={emphasize ? '#dc2626' : domainMuted ? palette.mutedStroke : palette.stroke}
                            strokeWidth={emphasize ? 2.4 : 1}
                          />
                          <text x={x + appBoxWidth / 2} y={y + 19} textAnchor="middle" fill={domainMuted ? palette.mutedText : palette.text} fontSize="14">{fitAppLabel(app.name)}</text>
                          <title>{app.name}</title>
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

      <div className="space-y-2">
        {detailHidden ? (
          <div className="flex justify-end">
            <button
              onClick={() => setDetailHidden(false)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              title="显示能力节点详情"
            >
              +
            </button>
          </div>
        ) : null}

        {!detailHidden ? (
          <aside className="w-[320px] rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">能力节点详情</h3>
              <button
                onClick={() => setDetailHidden(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                title="隐藏能力节点详情"
              >
                −
              </button>
            </div>
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
        ) : null}
      </div>
    </div>
  )
}
