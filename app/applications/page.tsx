import Link from 'next/link'
import { Activity, AppWindowMac, CircleDot, Filter, Grid2x2, Server, Sparkles } from 'lucide-react'
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
  searchParams?: { q?: string; status?: string; nodeType?: string; nodeId?: string }
}) {
  const q = searchParams?.q?.trim() || ''
  const status = searchParams?.status?.trim() || ''
  const nodeType = searchParams?.nodeType?.trim() || ''
  const nodeId = searchParams?.nodeId?.trim() || ''
  const nodeFilterOnApplications = nodeType === 'application' && nodeId

  const where = {
    ...(q
      ? {
          OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { owner: { contains: q, mode: 'insensitive' as const } }]
        }
      : {}),
    ...(status ? { lifecycleStatus: status as any } : {}),
    ...(nodeFilterOnApplications ? { id: nodeId } : {}),
    ...(nodeType === 'capability' && nodeId
      ? {
          capabilityLinks: {
            some: {
              capabilityId: nodeId
            }
          }
        }
      : {})
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
          <p className="mt-1 text-2xl font-semibold text-sky-600">{countMap.PLANNED ?? 0}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500">SUNSETTING / RETIRED</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{(countMap.SUNSETTING ?? 0) + (countMap.RETIRED ?? 0)}</p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">业务应用总览</h2>
            <p className="muted">支持关键词和生命周期筛选，点击行进入详情。</p>
          </div>
          <Badge tone="blue" className="hidden md:inline-flex">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Apple-like UI
          </Badge>
        </div>

        {nodeType && nodeId ? (
          <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
            已应用来自关系树的筛选：{nodeType === 'application' ? '当前应用节点' : '当前能力节点关联的应用'}
          </div>
        ) : null}

        <form className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input name="q" defaultValue={q} placeholder="搜索应用名称/Owner" className="mac-input" />
          <select name="status" defaultValue={status} className="mac-input">
            <option value="">全部状态</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="SUNSETTING">SUNSETTING</option>
            <option value="RETIRED">RETIRED</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            <Filter className="h-4 w-4" /> 筛选
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90">
          <table className="mac-table w-full">
            <thead className="bg-slate-50/85">
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">没有匹配的数据，试试调整筛选条件。</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100/90 hover:bg-sky-50/40">
                    <td>
                      <Link href={`/applications/${item.id}`} className="inline-flex items-center gap-2 font-medium text-slate-900 hover:text-sky-700">
                        <AppWindowMac className="h-4 w-4 text-slate-500" />
                        {item.name}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.description || '-'}</p>
                    </td>
                    <td>{item.owner || '-'}</td>
                    <td>
                      <Badge tone={toneByLifecycle(item.lifecycleStatus)}>{item.lifecycleStatus}</Badge>
                    </td>
                    <td className="font-medium text-slate-600"><Grid2x2 className="mr-1 inline h-3.5 w-3.5" />{item.capabilityLinks.length}</td>
                    <td className="font-medium text-slate-600"><CircleDot className="mr-1 inline h-3.5 w-3.5" />{item.stackLinks.length}</td>
                    <td className="font-medium text-slate-600"><Server className="mr-1 inline h-3.5 w-3.5" />{item.platformLinks.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold"><Activity className="h-4 w-4 text-slate-500" />新建业务应用</h3>
        <EntityForm action={createApplication} fields={['name', 'description', 'owner']} submitText="创建应用" />
      </Card>
    </div>
  )
}
