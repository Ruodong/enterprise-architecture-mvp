import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CapabilityApplicationMindmap } from '@/components/capability-application-mindmap'

export default async function RelationshipTreePage({
  searchParams
}: {
  searchParams?: {
    capQ?: string
    capOwner?: string
    capStatus?: string
    appQ?: string
    appOwner?: string
    appStatus?: string
  }
}) {
  const capQ = searchParams?.capQ?.trim() || ''
  const capOwner = searchParams?.capOwner?.trim() || ''
  const capStatus = searchParams?.capStatus?.trim() || ''
  const appQ = searchParams?.appQ?.trim() || ''
  const appOwner = searchParams?.appOwner?.trim() || ''
  const appStatus = searchParams?.appStatus?.trim() || ''

  const hasCapFilter = Boolean(capQ || capOwner || capStatus)
  const hasAppFilter = Boolean(appQ || appOwner || appStatus)
  const hasAnyFilter = hasCapFilter || hasAppFilter

  const appWhere = {
    ...(appQ ? { name: { contains: appQ, mode: 'insensitive' as const } } : {}),
    ...(appOwner ? { owner: { equals: appOwner } } : {}),
    ...(appStatus ? { lifecycleStatus: appStatus as any } : {})
  }

  const allCapabilities = await prisma.businessCapability.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      parentId: true,
      owner: true,
      lifecycleStatus: true,
      diagramX: true,
      diagramY: true,
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

  const capMatch = (cap: (typeof allCapabilities)[number]) => {
    if (!hasCapFilter) return true
    const okName = capQ ? cap.name.toLowerCase().includes(capQ.toLowerCase()) : true
    const okOwner = capOwner ? (cap.owner ?? '') === capOwner : true
    const okStatus = capStatus ? cap.lifecycleStatus === (capStatus as any) : true
    return okName && okOwner && okStatus
  }

  let capabilities = allCapabilities

  if (hasAnyFilter) {
    const byId = new Map(allCapabilities.map((c) => [c.id, c]))
    const keep = new Set<string>()

    // 只把“有应用”的能力作为筛选命中入口；没有应用的L3不显示
    allCapabilities.forEach((cap) => {
      if (capMatch(cap) && cap.appLinks.length > 0) {
        keep.add(cap.id)
        let current = cap.parentId
        while (current) {
          keep.add(current)
          current = byId.get(current)?.parentId ?? null
        }
      }
    })

    capabilities = allCapabilities.filter((c) => keep.has(c.id))
  }

  const [capOwners, appOwners] = await Promise.all([
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
    })
  ])

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">业务能力/业务能力图</h2>
        <p className="mt-1 text-sm text-slate-500">按业务能力属性或应用属性筛选图谱内容（能力、应用和连线都会同步过滤）。</p>

        <form className="mt-4 grid gap-3 md:grid-cols-3">
          <input name="capQ" defaultValue={capQ} placeholder="筛选能力名称" className="mac-input" />
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

          <input name="appQ" defaultValue={appQ} placeholder="筛选应用名称" className="mac-input" />
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
          applications: item.appLinks.map((link) => ({ id: link.application.id, name: link.application.name }))
        }))}
      />
    </div>
  )
}
