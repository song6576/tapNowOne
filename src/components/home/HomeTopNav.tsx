/** 主应用顶栏：Logo、导航、用户菜单 */
import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import { TapNowLogo } from '../auth/TapNowLogo'
import { NAV_ITEMS } from '../../mock/data'
import { useI18n } from '../../store/langStore'
import { UserMenuDropdown } from './UserMenuDropdown'

function NavIcon({ type }: { type: string }) {
  const cls = 'h-5 w-5 shrink-0'
  switch (type) {
    case 'home':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
        </svg>
      )
    case 'workspace':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'taptv':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="5" width="20" height="14" rx="2.5" />
          <path d="M10 9.5l5 3-5 3v-6z" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 15H4.5a2.5 2.5 0 0 0 0 5H6M18 15h1.5a2.5 2.5 0 0 1 0 5H18" strokeLinecap="round" />
          <path d="M8 12h8" strokeLinecap="round" />
        </svg>
      )
  }
}

export const HomeTopNav = memo(function HomeTopNav() {
  const { t } = useI18n()

  return (
    <header className="home-topnav fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-black/80 px-5 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <NavLink to="/home">
          <TapNowLogo size="sm" />
        </NavLink>
      </div>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span
              key={item.path}
              className="home-topnav-tab home-topnav-tab--disabled"
              title={t.nav.arenaSoon}
            >
              <NavIcon type={item.icon} />
              {t.nav[item.labelKey]}
            </span>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/home'}
              className={({ isActive }) =>
                `home-topnav-tab ui-clickable ${isActive ? 'home-topnav-tab--active' : ''}`
              }
            >
              <NavIcon type={item.icon} />
              {t.nav[item.labelKey]}
            </NavLink>
          ),
        )}
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <button type="button" className="ui-clickable hidden text-sm text-white/55 hover:text-white/85 sm:block">
          {t.nav.pricing}
        </button>
        <button
          type="button"
          className="ui-clickable flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/5 hover:text-white/85"
          title={t.nav.notifications}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <UserMenuDropdown />
      </div>
    </header>
  )
})
