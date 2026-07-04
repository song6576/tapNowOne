/** 单行输入弹窗（重命名等） */
import { useEffect, useState } from 'react'
import { Portal } from './Portal'

interface InputDialogProps {
  open: boolean
  title: string
  value: string
  placeholder?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function InputDialog({
  open,
  title,
  value,
  placeholder,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <Portal>
      <div className="confirm-dialog-root fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={onCancel} aria-label="Close" />
        <form
          onSubmit={handleSubmit}
          className="confirm-dialog-panel relative z-10 w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#141416] p-6 shadow-2xl"
        >
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="login-input mt-4 w-full"
            autoFocus
          />
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onCancel} className="create-team-btn create-team-btn--ghost ui-clickable flex-1">
              {cancelLabel}
            </button>
            <button type="submit" className="create-team-btn create-team-btn--primary ui-clickable flex-1">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  )
}
