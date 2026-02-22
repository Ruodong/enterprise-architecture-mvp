import Link from 'next/link'
import { Layers3, PlusSquare } from 'lucide-react'
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
        <h2 className="section-title">技术栈清单</h2>
        <p className="mb-4 muted">用于识别技术标准化和复用情况。</p>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="rounded-xl border border-slate-200/85 bg-white/90 p-8 text-center text-sm text-slate-500">暂无技术栈数据</div>
          ) : (
            items.map((item) => (
              <Link key={item.id} href={`/stacks/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-200/85 bg-white/90 p-3.5 hover:border-sky-200 hover:bg-sky-50/40">
                <div>
                  <div className="inline-flex items-center gap-2 font-medium text-slate-900"><Layers3 className="h-4 w-4 text-slate-500" />{item.name}</div>
                  <div className="text-xs text-slate-500">Category: {item.category || '-'}</div>
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
        <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold"><PlusSquare className="h-4 w-4 text-slate-500" />新建技术栈</h3>
        <EntityForm action={createStack} fields={['name', 'description', 'category']} submitText="创建技术栈" />
      </Card>
    </div>
  )
}
