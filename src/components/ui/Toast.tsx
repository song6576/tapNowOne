import { useToastStore } from '../../store/toastStore'

const TYPE_BORDER: Record<string, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="toast-container pointer-events-none fixed inset-x-0 top-6 z-[9999] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`toast-enter pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-white/10 border-l-4 bg-[#1a1a1a]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md ${TYPE_BORDER[t.type] ?? TYPE_BORDER.info}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white/70"
            aria-label="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
