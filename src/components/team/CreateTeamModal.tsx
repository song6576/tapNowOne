/** 创建团队弹窗：独立计费提示 + 团队名称表单 */
import { useState } from 'react'
import { Portal } from '../ui/Portal'
import { useTeamStore } from '../../store/teamStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'

export function CreateTeamModal() {
  const open = useTeamStore((s) => s.createTeamModalOpen)
  const close = useTeamStore((s) => s.closeCreateTeamModal)
  const createTeam = useTeamStore((s) => s.createTeam)
  const { t } = useI18n()
  const c = t.createTeamModal
  const showToast = useToastStore((s) => s.showToast)
  const [name, setName] = useState('')

  if (!open) return null

  const canSubmit = name.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    createTeam(name.trim())
    setName('')
    showToast({ type: 'success', message: c.success })
  }

  return (
    <Portal>
      <div className="create-team-root fixed inset-0 z-[110] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={close} aria-label="Close" />
        <div role="dialog" aria-modal="true" className="create-team-panel relative z-10 w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#141416] p-6 shadow-2xl">
          <button type="button" onClick={close} className="ui-clickable absolute right-4 top-4 text-white/45 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-white">{c.title}</h2>
          <p className="mt-1 text-sm text-white/45">{c.subtitle}</p>

          <div className="create-team-notice mt-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {c.noticeTitle}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{c.noticeBody}</p>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-white/55">{c.teamName}<span className="text-red-400">*</span></label>
              <span className="text-xs text-white/30">{name.length}/50</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-medium text-white">
                  {(name.trim()[0] ?? 'T').toUpperCase()}
                </span>
              </div>
              <input
                type="text"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.teamNamePlaceholder}
                className="account-input flex-1"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={close} className="create-team-btn create-team-btn--ghost ui-clickable flex-1">
              {c.cancel}
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="create-team-btn create-team-btn--primary ui-clickable flex-1 disabled:opacity-40"
            >
              {c.confirm}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
