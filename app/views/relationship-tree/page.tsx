import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CapabilityApplicationMindmap } from '@/components/capability-application-mindmap'

export default async function RelationshipTreePage() {
  const capabilities = await prisma.businessCapability.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      parentId: true,
      appLinks: {
        select: {
          application: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }]
  })

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">业务能力 × 应用 SVG 图谱</h2>
        <p className="mt-1 text-sm text-slate-500">三层能力树（L1/L2/L3）与应用关联的思维导图式交互图。支持缩放、拖拽、节点选中联动。</p>
      </Card>

      <CapabilityApplicationMindmap
        capabilities={capabilities.map((item) => ({
          id: item.id,
          name: item.name,
          level: item.level,
          parentId: item.parentId,
          applications: item.appLinks.map((link) => ({ id: link.application.id, name: link.application.name }))
        }))}
      />
    </div>
  )
}
