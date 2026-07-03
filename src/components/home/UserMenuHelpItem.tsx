/** 用户菜单「帮助中心」左侧 flyout 子菜单（对齐 TapNow 图3） */
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { userMenuSubmenuFlyoutClass, type UserMenuSubmenuSide } from '../../utils/userMenuSubmenu'

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/35" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UserMenuHelpItem({ submenuSide = 'left' }: { submenuSide?: UserMenuSubmenuSide }) {
  const { t } = useI18n()
  const h = t.helpMenu
  const showToast = useToastStore((s) => s.showToast)
  const [subOpen, setSubOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const clearTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const handleEnter = () => {
    clearTimer()
    setSubOpen(true)
  }

  const handleLeave = () => {
    clearTimer()
    closeTimer.current = window.setTimeout(() => setSubOpen(false), 120)
  }

  const onItem = (label: string) => {
    showToast({ type: 'info', message: label })
    setSubOpen(false)
  }

  useEffect(() => () => clearTimer(), [])

  const items = [
    { key: 'contact' as const, label: h.contact, chevron: true },
    { key: 'tutorials' as const, label: h.tutorials },
    { key: 'shortcuts' as const, label: h.shortcuts },
    { key: 'feedback' as const, label: h.feedback },
  ]

  return (
    <li className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
          subOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
        }`}
      >
        <span className="text-white/50"><HelpIcon /></span>
        <span className="flex-1 text-white/80">{t.userMenu.help}</span>
        <ChevronRight />
      </button>

      {subOpen && (
        <div
          className={userMenuSubmenuFlyoutClass(submenuSide)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="user-menu-submenu-panel dropdown-panel min-w-[168px] overflow-hidden py-1">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onItem(item.label)}
                className="ui-clickable flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/5"
              >
                <span>{item.label}</span>
                {item.chevron && <ChevronRight />}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}
