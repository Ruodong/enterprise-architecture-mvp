import Link from 'next/link'
import { PlusSquare, Server } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { createPlatform } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

export default async function PlatformsPage() {
  const items = await prisma.techPlatform.findMany({
    include: { appLinks: true },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="section-title">技术平台目录</h2>
        <p className="mb-4 muted">平台视角查看应用承载分布。</p>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="rounded-xl border border-slate-200/85 bg-white/90 p-8 text-center text-sm text-slate-500">暂无技术平台数据</div>
          ) : (
            items.map((item) => (
              <Link key={item.id} href={`/platforms/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-200/85 bg-white/90 p-3.5 hover:border-sky-200 hover:bg-sky-50/40">
                <div>
                  <div className="inline-flex items-center gap-2 font-medium text-slate-900"><Server className="h-4 w-4 text-slate-500" />{item.name}</div>
                  <div className="text-xs text-slate-500">Vendor: {item.vendor || '-'}</div>
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
        <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold"><PlusSquare className="h-4 w-4 text-slate-500" />新建技术平台</h3>
        <EntityForm action={createPlatform} fields={['name', 'description', 'vendor']} submitText="创建技术平台" />
      </Card>
    </div>
  )
}
