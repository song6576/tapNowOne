/** 设置抽屉 */
import { useAuthStore } from '../../store/authStore'
import { useTeamStore } from '../../store/teamStore'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const user = useAuthStore((s) => s.user)
  const tapiesBalance = useTeamStore((s) => s.tapiesBalance)
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-[var(--tn-border)] bg-[var(--tn-bg-elevated)] shadow-2xl">
        <div className="flex h-[var(--tn-topbar-h)] items-center justify-between border-b border-[var(--tn-border-subtle)] px-4">
          <span className="text-sm font-medium">Settings</span>
          <button type="button" onClick={onClose} className="text-[var(--tn-text-muted)] hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--tn-text-muted)]">Account</h3>
            <div className="rounded-lg bg-[var(--tn-bg-panel)] p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tn-text-muted)]">UID</span>
                <span className="font-mono text-xs">{user?.id ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tn-text-muted)]">Email</span>
                <span>{user?.email ?? '—'}</span>
              </div>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--tn-text-muted)]">Credits</h3>
            <div className="rounded-lg bg-[var(--tn-bg-panel)] p-4 text-center">
              <p className="text-3xl font-semibold">{tapiesBalance.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[var(--tn-text-muted)]">remaining credits</p>
              <button type="button" className="tn-btn tn-btn-primary mt-4 w-full">Upgrade Plan</button>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--tn-text-muted)]">Language</h3>
            <select className="w-full rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] px-3 py-2 text-sm">
              <option>中文</option>
              <option>English</option>
            </select>
          </section>
        </div>
      </aside>
    </>
  )
}
