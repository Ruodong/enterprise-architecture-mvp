import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { CapabilityApplicationTree } from '@/components/capability-application-tree'

export default async function RelationshipTreePage() {
  const [capabilities, applications] = await Promise.all([
    prisma.businessCapability.findMany({
      include: {
        appLinks: {
          include: {
            application: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.businessApplication.findMany({
      include: {
        capabilityLinks: {
          include: {
            capability: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  ])

  const capabilityNodes = capabilities.map((item) => ({
    id: item.id,
    name: item.name,
    applications: item.appLinks.map((link) => ({
      id: link.application.id,
      name: link.application.name
    }))
  }))

  const applicationNodes = applications.map((item) => ({
    id: item.id,
    name: item.name,
    capabilities: item.capabilityLinks.map((link) => ({
      id: link.capability.id,
      name: link.capability.name
    }))
  }))

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">能力-应用关系树</h2>
        <p className="mt-1 text-sm text-slate-500">支持双向查看：业务能力 → 应用、应用 → 业务能力，可展开/收起。</p>
      </Card>

      <Card>
        <Suspense fallback={<p className="text-sm text-slate-500">加载关系树...</p>}>
          <CapabilityApplicationTree capabilities={capabilityNodes} applications={applicationNodes} />
        </Suspense>
      </Card>
    </div>
  )
}
