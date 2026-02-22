import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { deleteStack, updateStack } from '@/lib/actions'
import { Button } from '@/components/ui/button'

export default async function StackDetail({ params }: { params: { id: string } }) {
  const item = await prisma.techStack.findUnique({ where: { id: params.id }, include: { appLinks: { include: { application: true } } } })
  if (!item) return notFound()
  return <div className="space-y-4"><Card><h2 className="mb-3 text-lg font-semibold">编辑技术栈</h2><EntityForm action={updateStack.bind(null, item.id)} fields={['name', 'description', 'category']} defaults={{ name: item.name, description: item.description, category: item.category, lifecycleStatus: item.lifecycleStatus }} submitText="更新" /><form action={deleteStack.bind(null, item.id)} className="mt-3"><Button variant="destructive">删除</Button></form></Card><Card><h3 className="font-semibold">关联业务应用</h3><ul className="list-disc pl-5">{item.appLinks.map((r) => <li key={r.applicationId}>{r.application.name}</li>)}</ul></Card></div>
}
