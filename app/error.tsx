'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="panel mx-auto mt-8 max-w-2xl p-6">
      <h2 className="text-lg font-semibold text-slate-900">页面加载出错</h2>
      <p className="mt-2 text-sm text-slate-600">{error?.message || '发生未知错误，请稍后重试。'}</p>
      <button onClick={() => reset()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        重试
      </button>
    </div>
  )
}
