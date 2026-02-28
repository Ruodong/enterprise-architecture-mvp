'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppWindowMac, Boxes, Cpu, GitFork, Layers3, LayoutList, Network, Server } from 'lucide-react'

const links = [
  { label: '业务应用', href: '/applications', icon: AppWindowMac },
  { label: '业务能力', href: '/capabilities', icon: Boxes },
  { label: '技术栈', href: '/stacks', icon: Layers3 },
  { label: '技术平台', href: '/platforms', icon: Server },
  { label: '视角 · 按应用', href: '/views/applications', icon: LayoutList },
  { label: '视角 · 按业务能力', href: '/views/capabilities', icon: Network },
  { label: '视角 · 按技术平台', href: '/views/platforms', icon: Cpu },
  { label: '视角 · 能力应用树', href: '/views/relationship-tree', icon: GitFork }
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {links.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-sky-100/80 text-sky-800 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]'
                : 'text-slate-700 hover:bg-white/90 hover:text-slate-900'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-sky-700' : 'text-slate-500'}`} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
