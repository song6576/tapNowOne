/** 通用模态框：遮罩、标题、关闭 */
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, subtitle, children, footer, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-root fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="modal-backdrop absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
      <div
        role="dialog"
        aria-modal="true"
        className={`modal-panel relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl ${wide ? 'max-w-[920px]' : 'max-w-[480px]'}`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-clickable flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
