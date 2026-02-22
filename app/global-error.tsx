'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-100 p-6 text-slate-900">
        <div className="panel mx-auto mt-8 max-w-2xl p-6">
          <h2 className="text-lg font-semibold">应用发生错误</h2>
          <p className="mt-2 text-sm text-slate-600">{error?.message || '全局异常，请重试。'}</p>
          <button onClick={() => reset()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            重试
          </button>
        </div>
      </body>
    </html>
  )
}
