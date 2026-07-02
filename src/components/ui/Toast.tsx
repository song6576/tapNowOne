import { useToastStore } from '../../store/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="toast-container pointer-events-none fixed inset-x-0 top-6 z-[9999] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`toast-enter pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-white/10  bg-[#1a1a1a]/95 px-3 py-3 text-sm text-white shadow-2xl backdrop-blur-md`}
        >
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
