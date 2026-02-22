import { notFound } from 'next/navigation'
import { PencilLine, Server, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { deletePlatform, updatePlatform } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PlatformDetail({ params }: { params: { id: string } }) {
  const item = await prisma.techPlatform.findUnique({ where: { id: params.id }, include: { appLinks: { include: { application: true } } } })
  if (!item) return notFound()

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title inline-flex items-center gap-2"><PencilLine className="h-4 w-4 text-slate-500" />编辑技术平台</h2>
          <Badge tone="slate">{item.lifecycleStatus}</Badge>
        </div>
        <EntityForm action={updatePlatform.bind(null, item.id)} fields={['name', 'description', 'vendor']} defaults={{ name: item.name, description: item.description, vendor: item.vendor, lifecycleStatus: item.lifecycleStatus }} submitText="更新" />
        <form action={deletePlatform.bind(null, item.id)} className="mt-4"><Button variant="destructive"><Trash2 className="mr-1.5 h-4 w-4" />删除</Button></form>
      </Card>

      <Card>
        <h3 className="mb-3 inline-flex items-center gap-2 font-semibold"><Server className="h-4 w-4 text-slate-500" />关联业务应用</h3>
        {item.appLinks.length ? (
          <ul className="space-y-2">{item.appLinks.map((r) => <li key={r.applicationId} className="rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2 text-sm">{r.application.name}</li>)}</ul>
        ) : (
          <p className="muted">暂无关联应用</p>
        )}
      </Card>
    </div>
  )
}
