/** 旧版顶栏 */
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useTeamStore } from '../../store/teamStore'

interface TopBarProps {
  title?: string
  showCredits?: boolean
  onSettingsClick?: () => void
  children?: React.ReactNode
}

export function TopBar({ title, showCredits = true, onSettingsClick, children }: TopBarProps) {
  const user = useAuthStore((s) => s.user)
  const tapiesBalance = useTeamStore((s) => s.tapiesBalance)

  return (
    <header
      className="flex h-[var(--tn-topbar-h)] shrink-0 items-center gap-3 border-b border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] px-4"
    >
      {title && (
        <h1 className="text-sm font-medium text-[var(--tn-text)]">{title}</h1>
      )}
      {children}
      <div className="ml-auto flex items-center gap-3">
        {showCredits && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--tn-bg-panel)] px-3 py-1 text-xs text-[var(--tn-text-secondary)]">
            <span className="text-[var(--tn-node-video)]">⚡</span>
            <span>{tapiesBalance.toLocaleString()}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--tn-text-muted)] hover:bg-[var(--tn-bg-hover)] hover:text-[var(--tn-text-secondary)]"
          title="Settings"
        >
          ⚙
        </button>
        <Link
          to="/home"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tn-bg-hover)] text-xs font-medium text-[var(--tn-text-secondary)]"
        >
          {user?.name?.[0] ?? '?'}
        </Link>
      </div>
    </header>
  )
}
