import Link from 'next/link'
import { Card } from '@/components/ui/card'

const quickLinks = [
  { href: '/views/relationship-tree', title: 'Lenovo Business Capability Map', desc: 'SVG 图谱（缩放、拖拽、折叠）' },
  { href: '/applications', title: '业务应用', desc: '应用清单与关联信息' },
  { href: '/capabilities', title: '业务能力', desc: 'L1/L2/L3 能力体系与覆盖' },
  { href: '/platforms', title: '技术平台', desc: '平台承载与应用关系' }
]

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">欢迎使用 Enterprise Architecture Console</h2>
        <p className="mt-1 text-sm text-slate-500">首页已改为稳定仪表盘入口，不再重定向，减少 dev 环境下样式/脚本热更新抖动。</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="panel block p-4 transition hover:-translate-y-0.5 hover:bg-white/95">
            <p className="text-base font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
