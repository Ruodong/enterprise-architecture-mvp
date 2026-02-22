import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { createCapability } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

export default async function CapabilitiesPage() {
  const items = await prisma.businessCapability.findMany({
    include: { appLinks: true },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-1 text-lg font-semibold">业务能力地图</h2>
        <p className="mb-4 text-sm text-slate-500">查看能力沉淀情况和被应用覆盖程度。</p>
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/capabilities/${item.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-200 hover:bg-blue-50/40">
              <div>
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">Owner: {item.owner || '-'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="slate">{item.lifecycleStatus}</Badge>
                <Badge tone="blue">关联应用 {item.appLinks.length}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">新建业务能力</h3>
        <EntityForm action={createCapability} fields={['name', 'description', 'owner']} submitText="创建能力" />
      </Card>
    </div>
  )
}
