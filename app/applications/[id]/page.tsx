import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { deleteApplication, updateApplication } from '@/lib/actions'
import { Button } from '@/components/ui/button'

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
        <h2 className="mb-3 text-lg font-semibold">编辑业务应用</h2>
        <EntityForm action={updateApplication.bind(null, item.id)} fields={['name', 'description', 'owner']} defaults={{ name: item.name, description: item.description, owner: item.owner, lifecycleStatus: item.lifecycleStatus }} submitText="更新" />
        <form action={deleteApplication.bind(null, item.id)} className="mt-3"><Button variant="destructive">删除</Button></form>
      </Card>
      <Card><h3 className="font-semibold">关联业务能力</h3><ul className="list-disc pl-5">{item.capabilityLinks.map((r) => <li key={r.capabilityId}>{r.capability.name}</li>)}</ul></Card>
      <Card><h3 className="font-semibold">关联技术栈</h3><ul className="list-disc pl-5">{item.stackLinks.map((r) => <li key={r.stackId}>{r.stack.name}</li>)}</ul></Card>
      <Card><h3 className="font-semibold">关联技术平台</h3><ul className="list-disc pl-5">{item.platformLinks.map((r) => <li key={r.platformId}>{r.platform.name}</li>)}</ul></Card>
    </div>
  )
}
