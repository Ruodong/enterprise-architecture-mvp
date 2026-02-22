import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { EntityForm } from '@/components/forms/entity-form'
import { createApplication } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

function toneByLifecycle(status: string): 'emerald' | 'blue' | 'amber' | 'rose' {
  if (status === 'ACTIVE') return 'emerald'
  if (status === 'PLANNED') return 'blue'
  if (status === 'SUNSETTING') return 'amber'
  return 'rose'
}

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams?: { q?: string; status?: string }
}) {
  const q = searchParams?.q?.trim() || ''
  const status = searchParams?.status?.trim() || ''

  const where = {
    ...(q
      ? {
          OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { owner: { contains: q, mode: 'insensitive' as const } }]
        }
      : {}),
    ...(status ? { lifecycleStatus: status as any } : {})
  }

  const [items, total, grouped] = await Promise.all([
    prisma.businessApplication.findMany({
      where,
      include: {
        capabilityLinks: true,
        stackLinks: true,
        platformLinks: true
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.businessApplication.count(),
    prisma.businessApplication.groupBy({ by: ['lifecycleStatus'], _count: true })
  ])

  const countMap = Object.fromEntries(grouped.map((g) => [g.lifecycleStatus, g._count]))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="kpi-card">
          <p className="text-xs text-slate-500">应用总数</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">ACTIVE</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{countMap.ACTIVE ?? 0}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">PLANNED</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{countMap.PLANNED ?? 0}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">SUNSETTING / RETIRED</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{(countMap.SUNSETTING ?? 0) + (countMap.RETIRED ?? 0)}</p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">业务应用总览</h2>
            <p className="text-sm text-slate-500">支持关键词和生命周期筛选，点击行进入详情。</p>
          </div>
        </div>

        <form className="mb-4 grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索应用名称/Owner"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:ring"
          />
          <select name="status" defaultValue={status} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 focus:ring">
            <option value="">全部状态</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="SUNSETTING">SUNSETTING</option>
            <option value="RETIRED">RETIRED</option>
          </select>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">筛选</button>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="data-table w-full bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th>应用</th>
                <th>Owner</th>
                <th>状态</th>
                <th>能力数</th>
                <th>技术栈数</th>
                <th>平台数</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td>
                    <Link href={`/applications/${item.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                      {item.name}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.description || '-'}</p>
                  </td>
                  <td>{item.owner || '-'}</td>
                  <td>
                    <Badge tone={toneByLifecycle(item.lifecycleStatus)}>{item.lifecycleStatus}</Badge>
                  </td>
                  <td>{item.capabilityLinks.length}</td>
                  <td>{item.stackLinks.length}</td>
                  <td>{item.platformLinks.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">新建业务应用</h3>
        <EntityForm action={createApplication} fields={['name', 'description', 'owner']} submitText="创建应用" />
      </Card>
    </div>
  )
}
