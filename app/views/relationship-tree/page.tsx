import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CapabilityApplicationMindmap } from '@/components/capability-application-mindmap'

type CapabilityItem = {
  id: string
  name: string
  level: number
  parentId: string | null
  owner: string | null
  lifecycleStatus: string
  diagramX: number | null
  diagramY: number | null
  children: { id: string }[]
  _count: { appLinks: number }
  appLinks: { application: { id: string; name: string } }[]
}

export default async function RelationshipTreePage({
  searchParams
}: {
  searchParams?: {
    capId?: string
    capOwner?: string
    capStatus?: string
    appQ?: string
    appOwner?: string
    appStatus?: string
    leafOnly?: string
  }
}) {
  const capId = searchParams?.capId?.trim() || ''
  const capOwner = searchParams?.capOwner?.trim() || ''
  const capStatus = searchParams?.capStatus?.trim() || ''
  const appQ = searchParams?.appQ?.trim() || ''
  const appOwner = searchParams?.appOwner?.trim() || ''
  const appStatus = searchParams?.appStatus?.trim() || ''
  const leafOnly = searchParams?.leafOnly === '1'

  const hasCapFilter = Boolean(capId || capOwner || capStatus)
  const hasAppFilter = Boolean(appQ || appOwner || appStatus)
  const hasAnyFilter = hasCapFilter || hasAppFilter

  const appWhere = {
    ...(appQ ? { name: { contains: appQ, mode: 'insensitive' as const } } : {}),
    ...(appOwner ? { owner: { equals: appOwner } } : {}),
    ...(appStatus ? { lifecycleStatus: appStatus as any } : {})
  }

  const allCapabilities: CapabilityItem[] = await prisma.businessCapability.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      parentId: true,
      owner: true,
      lifecycleStatus: true,
      diagramX: true,
      diagramY: true,
      children: { select: { id: true } },
      _count: {
        select: { appLinks: true }
      },
      appLinks: {
        where: hasAppFilter ? { application: appWhere } : undefined,
        select: {
          application: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }]
  })

  const byId = new Map(allCapabilities.map((c) => [c.id, c]))
  const byParent = new Map<string, CapabilityItem[]>()
  allCapabilities.forEach((c) => {
    if (!c.parentId) return
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  })

  const selectedSubtreeIds = new Set<string>()
  const walkSubtree = (id: string) => {
    selectedSubtreeIds.add(id)
    const children = byParent.get(id) ?? []
    children.forEach((child) => walkSubtree(child.id))
  }
  if (capId) walkSubtree(capId)

  const capMatch = (cap: CapabilityItem) => {
    const okNode = capId ? selectedSubtreeIds.has(cap.id) : true
    const okOwner = capOwner ? (cap.owner ?? '') === capOwner : true
    const okStatus = capStatus ? cap.lifecycleStatus === (capStatus as any) : true
    return okNode && okOwner && okStatus
  }

  const buildCapabilityTreeOptions = () => {
    const roots = allCapabilities.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    const ordered: CapabilityItem[] = []

    const dfs = (node: CapabilityItem) => {
      ordered.push(node)
      const children = (byParent.get(node.id) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      children.forEach(dfs)
    }

    roots.forEach(dfs)
    return ordered
  }

  let capabilities = allCapabilities

  if (hasAnyFilter || leafOnly) {
    const collectKeep = (enforceLeafOnly: boolean) => {
      const keep = new Set<string>()
      allCapabilities.forEach((cap) => {
        const isLeaf = cap.children.length === 0
        if (enforceLeafOnly && !isLeaf) return

        if (capMatch(cap) && cap.appLinks.length > 0) {
          keep.add(cap.id)
          let current = cap.parentId
          while (current) {
            keep.add(current)
            current = byId.get(current)?.parentId ?? null
          }
        }
      })
      return keep
    }

    let keep = collectKeep(leafOnly)

    if (keep.size === 0 && hasAppFilter && leafOnly) {
      keep = collectKeep(false)
    }

    capabilities = allCapabilities.filter((c) => keep.has(c.id))
  }

  const [capOwners, appOwners, applicationNames] = await Promise.all([
    prisma.businessCapability.findMany({
      select: { owner: true },
      distinct: ['owner'],
      where: { owner: { not: null } },
      orderBy: { owner: 'asc' }
    }),
    prisma.businessApplication.findMany({
      select: { owner: true },
      distinct: ['owner'],
      where: { owner: { not: null } },
      orderBy: { owner: 'asc' }
    }),
    prisma.businessApplication.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    })
  ])

  const capabilityTreeOptions = buildCapabilityTreeOptions()

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">业务能力/应用关系图</h2>
        <p className="mt-1 text-sm text-slate-500">按业务能力属性或应用属性筛选图谱内容（能力、应用颜色分组和连线都会同步过滤）。</p>

        <form className="mt-4 grid gap-3 md:grid-cols-3">
          <select name="capId" defaultValue={capId} className="mac-input w-full">
            <option value="">业务能力树（全部）</option>
            {capabilityTreeOptions.map((item) => (
              <option key={item.id} value={item.id}>{`${'　'.repeat(Math.max(0, item.level - 1))}L${item.level} · ${item.name}`}</option>
            ))}
          </select>
          <select name="capOwner" defaultValue={capOwner} className="mac-input">
            <option value="">能力Owner（全部）</option>
            {capOwners.map((o) => (
              <option key={o.owner ?? 'none'} value={o.owner ?? ''}>{o.owner}</option>
            ))}
          </select>
          <select name="capStatus" defaultValue={capStatus} className="mac-input">
            <option value="">能力状态（全部）</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="SUNSETTING">SUNSETTING</option>
            <option value="RETIRED">RETIRED</option>
          </select>

          <select name="appQ" defaultValue={appQ} className="mac-input w-full">
            <option value="">应用名称（全部）</option>
            {applicationNames.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
          <select name="appOwner" defaultValue={appOwner} className="mac-input">
            <option value="">应用Owner（全部）</option>
            {appOwners.map((o) => (
              <option key={o.owner ?? 'none'} value={o.owner ?? ''}>{o.owner}</option>
            ))}
          </select>
          <select name="appStatus" defaultValue={appStatus} className="mac-input">
            <option value="">应用状态（全部）</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="SUNSETTING">SUNSETTING</option>
            <option value="RETIRED">RETIRED</option>
          </select>

          <div className="md:col-span-3 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="leafOnly" value="1" defaultChecked={leafOnly} className="h-4 w-4 rounded border-slate-300" />
              仅显示叶子能力（L3/无下级）
            </label>
          </div>

          <div className="md:col-span-3">
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">筛选</button>
          </div>
        </form>
      </Card>

      <CapabilityApplicationMindmap
        capabilities={capabilities.map((item) => ({
          id: item.id,
          name: item.name,
          level: item.level,
          parentId: item.parentId,
          diagramX: item.diagramX,
          diagramY: item.diagramY,
          appCount: item._count.appLinks,
          applications: item.appLinks.map((link) => ({ id: link.application.id, name: link.application.name }))
        }))}
      />
    </div>
  )
}
