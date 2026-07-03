/** 通用二次确认弹窗 */
import { Portal } from './Portal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <Portal>
      <div className="confirm-dialog-root fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={onCancel} aria-label="Close" />
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="confirm-dialog-panel relative z-10 w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#141416] p-6 shadow-2xl"
        >
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">{title}</h2>
          <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-white/50">{message}</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onCancel} className="create-team-btn create-team-btn--ghost ui-clickable flex-1">
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`create-team-btn ui-clickable flex-1 ${danger ? 'create-team-btn--danger' : 'create-team-btn--primary'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
