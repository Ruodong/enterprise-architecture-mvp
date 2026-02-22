import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'

const tone = {
  capability: 'bg-blue-100 text-blue-700',
  stack: 'bg-emerald-100 text-emerald-700',
  platform: 'bg-violet-100 text-violet-700'
}

function Chip({ text, cls }: { text: string; cls: string }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${cls}`}>{text}</span>
}

export default async function ViewByApplications() {
  const apps = await prisma.businessApplication.findMany({
    include: {
      capabilityLinks: { include: { capability: true } },
      stackLinks: { include: { stack: true } },
      platformLinks: { include: { platform: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const total = apps.length
  const totalCap = apps.reduce((s, a) => s + a.capabilityLinks.length, 0)
  const totalStack = apps.reduce((s, a) => s + a.stackLinks.length, 0)
  const totalPlatform = apps.reduce((s, a) => s + a.platformLinks.length, 0)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">驾驶舱 · 按应用观测</h2>
        <p className="mt-1 text-sm text-slate-500">前看汇总，后看每个应用的能力/技术/平台明细。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="kpi-card"><p className="text-xs text-slate-500">应用总数</p><p className="mt-1 text-2xl font-semibold">{total}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">能力关联总数</p><p className="mt-1 text-2xl font-semibold text-blue-600">{totalCap}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">技术栈关联总数</p><p className="mt-1 text-2xl font-semibold text-emerald-600">{totalStack}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">平台关联总数</p><p className="mt-1 text-2xl font-semibold text-violet-600">{totalPlatform}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Chip text="能力（蓝）" cls={tone.capability} />
          <Chip text="技术栈（绿）" cls={tone.stack} />
          <Chip text="技术平台（紫）" cls={tone.platform} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">应用明细</h3>
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{app.name}</p>
              <p className="mb-2 text-xs text-slate-500">Owner: {app.owner || '-'} · {app.lifecycleStatus}</p>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">能力:</span>
                  {app.capabilityLinks.length ? app.capabilityLinks.map((x) => <Chip key={x.capabilityId} text={x.capability.name} cls={tone.capability} />) : <span className="text-slate-400">-</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">技术栈:</span>
                  {app.stackLinks.length ? app.stackLinks.map((x) => <Chip key={x.stackId} text={x.stack.name} cls={tone.stack} />) : <span className="text-slate-400">-</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">平台:</span>
                  {app.platformLinks.length ? app.platformLinks.map((x) => <Chip key={x.platformId} text={x.platform.name} cls={tone.platform} />) : <span className="text-slate-400">-</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
