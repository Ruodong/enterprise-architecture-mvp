import Link from 'next/link'
import { Boxes, PlusSquare } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { createCapability } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

export default async function CapabilitiesPage({
  searchParams
}: {
  searchParams?: { nodeType?: string; nodeId?: string }
}) {
  const nodeType = searchParams?.nodeType?.trim() || ''
  const nodeId = searchParams?.nodeId?.trim() || ''

  const where = {
    ...(nodeType === 'capability' && nodeId ? { id: nodeId } : {}),
    ...(nodeType === 'application' && nodeId
      ? {
          appLinks: {
            some: {
              applicationId: nodeId
            }
          }
        }
      : {})
  }

  const items = await prisma.businessCapability.findMany({
    where,
    include: { appLinks: true },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="section-title">业务能力地图</h2>
        <p className="mb-4 muted">查看能力沉淀情况和被应用覆盖程度。</p>

        {nodeType && nodeId ? (
          <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
            已应用来自关系树的筛选：{nodeType === 'capability' ? '当前能力节点' : '当前应用节点关联的能力'}
          </div>
        ) : null}

        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="rounded-xl border border-slate-200/85 bg-white/90 p-8 text-center text-sm text-slate-500">暂无业务能力数据</div>
          ) : (
            items.map((item) => (
              <Link key={item.id} href={`/capabilities/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-200/85 bg-white/90 p-3.5 hover:border-sky-200 hover:bg-sky-50/40">
                <div>
                  <div className="inline-flex items-center gap-2 font-medium text-slate-900"><Boxes className="h-4 w-4 text-slate-500" />{item.name}</div>
                  <div className="text-xs text-slate-500">Owner: {item.owner || '-'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="slate">{item.lifecycleStatus}</Badge>
                  <Badge tone="blue">关联应用 {item.appLinks.length}</Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold"><PlusSquare className="h-4 w-4 text-slate-500" />新建业务能力</h3>
        <EntityForm action={createCapability} fields={['name', 'description', 'owner']} submitText="创建能力" />
      </Card>
    </div>
  )
}
