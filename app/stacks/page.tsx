import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { createStack } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

export default async function StacksPage() {
  const items = await prisma.techStack.findMany({
    include: { appLinks: true },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-1 text-lg font-semibold">技术栈清单</h2>
        <p className="mb-4 text-sm text-slate-500">用于识别技术标准化和复用情况。</p>
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/stacks/${item.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-200 hover:bg-blue-50/40">
              <div>
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">Category: {item.category || '-'}</div>
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
        <h3 className="mb-3 text-base font-semibold">新建技术栈</h3>
        <EntityForm action={createStack} fields={['name', 'description', 'category']} submitText="创建技术栈" />
      </Card>
    </div>
  )
}
