import { notFound } from 'next/navigation'
import { AppWindowMac, Boxes, CircleDot, PencilLine, Server, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { deleteApplication, updateApplication } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function ApplicationDetail({ params }: { params: { id: string } }) {
  const item = await prisma.businessApplication.findUnique({
    where: { id: params.id },
    include: {
      capabilityLinks: { include: { capability: true } },
      stackLinks: { include: { stack: true } },
      platformLinks: { include: { platform: true } }
    }
  })
  if (!item) return notFound()

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="section-title inline-flex items-center gap-2"><PencilLine className="h-4 w-4 text-slate-500" />编辑业务应用</h2>
            <p className="muted mt-1">维护应用基础信息和生命周期。</p>
          </div>
          <Badge tone="slate">{item.lifecycleStatus}</Badge>
        </div>
        <EntityForm action={updateApplication.bind(null, item.id)} fields={['name', 'description', 'owner']} defaults={{ name: item.name, description: item.description, owner: item.owner, lifecycleStatus: item.lifecycleStatus }} submitText="更新" />
        <form action={deleteApplication.bind(null, item.id)} className="mt-4"><Button variant="destructive"><Trash2 className="mr-1.5 h-4 w-4" />删除</Button></form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="mb-3 inline-flex items-center gap-2 font-semibold"><Boxes className="h-4 w-4 text-slate-500" />关联业务能力</h3>
          {item.capabilityLinks.length ? (
            <ul className="space-y-2">{item.capabilityLinks.map((r) => <li key={r.capabilityId} className="rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2 text-sm">{r.capability.name}</li>)}</ul>
          ) : (
            <p className="muted">暂无关联能力</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 inline-flex items-center gap-2 font-semibold"><CircleDot className="h-4 w-4 text-slate-500" />关联技术栈</h3>
          {item.stackLinks.length ? (
            <ul className="space-y-2">{item.stackLinks.map((r) => <li key={r.stackId} className="rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2 text-sm">{r.stack.name}</li>)}</ul>
          ) : (
            <p className="muted">暂无关联技术栈</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 inline-flex items-center gap-2 font-semibold"><Server className="h-4 w-4 text-slate-500" />关联技术平台</h3>
          {item.platformLinks.length ? (
            <ul className="space-y-2">{item.platformLinks.map((r) => <li key={r.platformId} className="rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2 text-sm">{r.platform.name}</li>)}</ul>
          ) : (
            <p className="muted">暂无关联平台</p>
          )}
        </Card>
      </div>
    </div>
  )
}
