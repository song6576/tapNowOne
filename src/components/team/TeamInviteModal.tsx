/** 邀请成员弹窗：展示邀请链接、有效期与配额说明 */
import { useEffect, useState } from 'react'
import { Portal } from '../ui/Portal'
import {
  getTeamInviteLink,
  regenerateTeamInviteLink,
  updateTeamInviteLink,
  type TeamInviteLink,
} from '../../api/client'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'

type Props = {
  open: boolean
  teamId: string
  onClose: () => void
}

export function TeamInviteModal({ open, teamId, onClose }: Props) {
  const { t } = useI18n()
  const v = t.accountViews.teamSettings.invite
  const showToast = useToastStore((s) => s.showToast)
  const [link, setLink] = useState<TeamInviteLink | null>(null)
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [expiresDays, setExpiresDays] = useState(7)
  const [unlimitedQuota, setUnlimitedQuota] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setSettingsOpen(false)
      return
    }
    setLoading(true)
    void getTeamInviteLink(teamId)
      .then((row) => {
        setLink(row)
        setExpiresDays(row.expires_in_days)
        setUnlimitedQuota(row.unlimited_quota)
      })
      .catch((err: unknown) => {
        showToast({
          type: 'info',
          message: err instanceof Error ? err.message : t.accountViews.teamSettings.loadFailed,
        })
        onClose()
      })
      .finally(() => setLoading(false))
  }, [open, teamId, onClose, showToast, t.accountViews.teamSettings.loadFailed])

  if (!open) return null

  const copyLink = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link.url)
      showToast({ type: 'success', message: v.copiedLink })
    } catch {
      showToast({ type: 'info', message: link.url })
    }
  }

  const handleRegenerate = () => {
    void regenerateTeamInviteLink(teamId)
      .then((row) => {
        setLink(row)
        setExpiresDays(row.expires_in_days)
        setUnlimitedQuota(row.unlimited_quota)
        showToast({ type: 'success', message: v.regenerate })
      })
      .catch((err: unknown) => {
        showToast({ type: 'info', message: err instanceof Error ? err.message : v.regenerate })
      })
  }

  const handleSaveSettings = () => {
    setSaving(true)
    void updateTeamInviteLink(teamId, {
      expiresInDays: expiresDays,
      unlimitedQuota,
    })
      .then((row) => {
        setLink(row)
        setSettingsOpen(false)
        showToast({ type: 'success', message: v.savedSettings })
      })
      .catch((err: unknown) => {
        showToast({ type: 'info', message: err instanceof Error ? err.message : v.saveSettings })
      })
      .finally(() => setSaving(false))
  }

  return (
    <Portal>
      <div className="team-invite-root fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={onClose} aria-label="Close" />
        <div role="dialog" aria-modal="true" className="team-invite-panel relative z-10 w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141416] p-6 shadow-2xl">
          <button type="button" onClick={onClose} className="ui-clickable absolute right-4 top-4 text-white/45 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-white">{v.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/45">{v.desc}</p>

          {loading ? (
            <div className="mt-8 flex min-h-[120px] items-center justify-center text-sm text-white/35">…</div>
          ) : link ? (
            <>
              <div className="team-invite-link-row mt-6">
                <input type="text" readOnly value={link.url} className="team-invite-link-input" />
                <button type="button" onClick={() => void copyLink()} className="team-invite-copy ui-clickable" aria-label={v.copyLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="team-invite-notice mt-4">
                <p className="text-sm text-sky-300">
                  {v.expiresIn.replace('{days}', String(link.expires_in_days))}
                </p>
                {link.unlimited_quota && (
                  <p className="mt-1 text-xs text-white/40">{v.unlimitedNote}</p>
                )}
              </div>

              {settingsOpen ? (
                <div className="team-invite-settings mt-5 space-y-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-sm font-medium text-white">{v.settingsTitle}</p>
                  <label className="block text-xs text-white/45">
                    {v.expiresDays}
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={expiresDays}
                      onChange={(e) => setExpiresDays(Math.max(1, Math.min(365, Number(e.target.value) || 7)))}
                      className="account-input mt-2 w-full"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={unlimitedQuota}
                      onChange={(e) => setUnlimitedQuota(e.target.checked)}
                      className="accent-sky-400"
                    />
                    {v.unlimitedQuota}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveSettings}
                      className="create-team-btn create-team-btn--primary ui-clickable flex-1 disabled:opacity-40"
                    >
                      {v.saveSettings}
                    </button>
                    <button type="button" onClick={handleRegenerate} className="create-team-btn create-team-btn--ghost ui-clickable">
                      {v.regenerate}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="team-invite-settings-btn ui-clickable"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
                    </svg>
                    {v.editSettings}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </Portal>
  )
}
