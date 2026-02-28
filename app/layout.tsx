import './globals.css'
import { ClientShell } from '@/components/client-shell'

export const metadata = {
  title: 'Enterprise Architecture Console'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
