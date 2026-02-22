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

export default async function ViewByCapabilities() {
  const items = await prisma.businessCapability.findMany({
    include: {
      appLinks: {
        include: {
          application: {
            include: {
              stackLinks: { include: { stack: true } },
              platformLinks: { include: { platform: true } }
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const total = items.length
  const covered = items.filter((x) => x.appLinks.length > 0).length

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">驾驶舱 · 按能力观测</h2>
        <p className="mt-1 text-sm text-slate-500">能力覆盖率 + 能力对应应用、技术、平台明细。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="kpi-card"><p className="text-xs text-slate-500">能力总数</p><p className="mt-1 text-2xl font-semibold text-blue-600">{total}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">已覆盖能力</p><p className="mt-1 text-2xl font-semibold">{covered}</p></div>
          <div className="kpi-card"><p className="text-xs text-slate-500">覆盖率</p><p className="mt-1 text-2xl font-semibold">{total ? Math.round((covered / total) * 100) : 0}%</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Chip text="能力（蓝）" cls={tone.capability} />
          <Chip text="技术栈（绿）" cls={tone.stack} />
          <Chip text="技术平台（紫）" cls={tone.platform} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold">能力明细</h3>
        <div className="space-y-3">
          {items.map((cap) => (
            <div key={cap.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Chip text={cap.name} cls={tone.capability} />
                <span className="text-xs text-slate-500">关联应用 {cap.appLinks.length}</span>
              </div>
              {cap.appLinks.length === 0 ? (
                <p className="text-sm text-slate-400">暂无应用支撑</p>
              ) : (
                <div className="space-y-2">
                  {cap.appLinks.map((l) => (
                    <div key={l.applicationId} className="rounded-md bg-slate-50 p-2">
                      <p className="text-sm font-medium text-slate-800">{l.application.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.application.stackLinks.map((s) => <Chip key={s.stackId} text={s.stack.name} cls={tone.stack} />)}
                        {l.application.platformLinks.map((p) => <Chip key={p.platformId} text={p.platform.name} cls={tone.platform} />)}
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
