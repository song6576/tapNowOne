/** 主应用顶栏：Logo、导航、用户菜单；默认透明，内容顶到顶栏后再显示背景 */
import { memo, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TapNowLogo } from '../auth/TapNowLogo'
import { NAV_ITEMS } from '../../config/navigation'
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

function readTopbarHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--tn-topbar-h').trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 56
}

export const HomeTopNav = memo(function HomeTopNav() {
  const { t } = useI18n()
  const location = useLocation()
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>(
      'main.home-page, main.profile-page, main.taptv-detail-page',
    )
    if (!scrollRoot) {
      setSolid(false)
      return
    }

    let frame = 0
    const updateSolid = () => {
      frame = 0
      const headerH = readTopbarHeight()
      const heroTitle = scrollRoot.querySelector<HTMLElement>('.home-hero-title')
      if (heroTitle) {
        setSolid(heroTitle.getBoundingClientRect().top <= headerH)
        return
      }
      setSolid(scrollRoot.scrollTop > 12)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateSolid)
    }

    updateSolid()
    scrollRoot.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      scrollRoot.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [location.pathname])

  return (
    <>
      <header
        className={`home-topnav fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-5 md:px-8${solid ? ' home-topnav--solid' : ''}`}
      >
        <div className="flex items-center gap-3">
          <NavLink to="/home">
            <TapNowLogo size="sm" />
          </NavLink>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label={t.nav.home}>
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
          <UserMenuDropdown />
        </div>
      </header>

      <nav className="home-mobile-nav md:hidden" aria-label={t.nav.home}>
        {NAV_ITEMS.filter((item) => !item.disabled).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/home'}
            className={({ isActive }) =>
              `home-mobile-nav__item ui-clickable ${isActive ? 'home-mobile-nav__item--active' : ''}`
            }
          >
            <NavIcon type={item.icon} />
            <span>{t.nav[item.labelKey]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
})
