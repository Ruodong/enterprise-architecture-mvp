import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Enterprise Architecture Console'
}

const links = [
  ['业务应用', '/applications'],
  ['业务能力', '/capabilities'],
  ['技术栈', '/stacks'],
  ['技术平台', '/platforms'],
  ['视角 · 按应用', '/views/applications'],
  ['视角 · 按业务能力', '/views/capabilities'],
  ['视角 · 按技术平台', '/views/platforms']
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl p-4 md:p-6">
          <header className="panel mb-4 flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enterprise Architecture</p>
              <h1 className="text-xl font-semibold text-slate-900">企业架构管理控制台</h1>
            </div>
            <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:block">MVP</div>
          </header>

          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <aside className="panel h-fit p-3">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
              <nav className="space-y-1">
                {links.map(([label, href]) => (
                  <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>

            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
