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

export default async function ViewByPlatforms() {
  const items = await prisma.techPlatform.findMany({
    include: {
      appLinks: {
        include: {
          application: {
            include: {
              capabilityLinks: { include: { capability: true } },
              stackLinks: { include: { stack: true } }
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const total = items.length
  const loadedApps = items.reduce((s, p) => s + p.appLinks.length, 0)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">驾驶舱 · 按平台观测</h2>
        <p className="mt-1 text-sm text-slate-500">平台承载情况 + 平台下应用的能力和技术组成。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="kpi-card"><p className="text-xs text-slate-500">平台总数</p><p className="mt-1 text-2xl font-semibold text-violet-600">{total}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">承载应用总数</p><p className="mt-1 text-2xl font-semibold">{loadedApps}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">平均每平台承载</p><p className="mt-1 text-2xl font-semibold">{total ? (loadedApps / total).toFixed(1) : '0'}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Chip text="能力（蓝）" cls={tone.capability} />
          <Chip text="技术栈（绿）" cls={tone.stack} />
          <Chip text="技术平台（紫）" cls={tone.platform} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">平台明细</h3>
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Chip text={p.name} cls={tone.platform} />
                <span className="text-xs text-slate-500">承载应用 {p.appLinks.length}</span>
              </div>
              {p.appLinks.length === 0 ? (
                <p className="text-sm text-slate-400">暂无应用</p>
              ) : (
                <div className="space-y-2">
                  {p.appLinks.map((l) => (
                    <div key={l.applicationId} className="rounded-md bg-slate-50 p-2">
                      <p className="text-sm font-medium text-slate-800">{l.application.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.application.capabilityLinks.map((c) => <Chip key={c.capabilityId} text={c.capability.name} cls={tone.capability} />)}
                        {l.application.stackLinks.map((s) => <Chip key={s.stackId} text={s.stack.name} cls={tone.stack} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
