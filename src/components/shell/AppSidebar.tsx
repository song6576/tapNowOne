/** 旧版侧边栏（部分页面可能未使用） */
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, MOCK_USER } from '../../mock/data'
import { useI18n } from '../../store/langStore'

interface AppSidebarProps {
  collapsed?: boolean
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const { t } = useI18n()

  return (
    <aside
      className="flex shrink-0 flex-col items-center border-r border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)]"
      style={{ width: collapsed ? 0 : 'var(--tn-sidebar-w)' }}
    >
      {/* Logo */}
      <NavLink to="/home" className="flex h-[var(--tn-topbar-h)] w-full items-center justify-center">
        <img
          src="https://fe-assets.tapnow.top/ad9f65d36e96daf0fcd1ba59146601de8a241292/tap_logo.webp"
          alt="TapNow"
          className="h-6 w-6 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
          }}
        />
        <span className="hidden text-sm font-bold tracking-tight text-white">TN</span>
      </NavLink>

      {/* Nav */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={t.nav[item.labelKey]}
            className={({ isActive }) =>
              `flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--tn-bg-hover)] text-white'
                  : 'text-[var(--tn-text-muted)] hover:bg-[var(--tn-bg-hover)] hover:text-[var(--tn-text-secondary)]'
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>

      {/* Avatar */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tn-bg-hover)] text-xs font-medium text-[var(--tn-text-secondary)]">
        {MOCK_USER.name[0]}
      </div>
    </aside>
  )
}
