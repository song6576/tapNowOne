/** 用户菜单内语言切换子项 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLangStore } from '../../store/langStore'
import { getLangLabel, LANG_OPTIONS } from '../../utils/lang'
import { userMenuSubmenuFlyoutClass, type UserMenuSubmenuSide } from '../../utils/userMenuSubmenu'

function LangMenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M5 6h7M8.5 6v12M6 17h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h5M17.5 8v8" strokeLinecap="round" />
      <path d="M14 16h7" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/35" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UserMenuLanguageItem({ submenuSide = 'left' }: { submenuSide?: UserMenuSubmenuSide }) {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
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

  const selectLang = useCallback((id: typeof lang) => {
    setLang(id)
    setSubOpen(false)
  }, [setLang])

  useEffect(() => () => clearTimer(), [])

  return (
    <li
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
          subOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
        }`}
      >
        <span className="text-white/50">
          <LangMenuIcon />
        </span>
        <span className="flex-1 text-white/80">{getLangLabel(lang)}</span>
        <ChevronRight />
      </button>

      {subOpen && (
        <div
          className={userMenuSubmenuFlyoutClass(submenuSide)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="user-menu-submenu-panel dropdown-panel min-w-[168px] overflow-hidden py-1">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectLang(opt.id)}
                className="ui-clickable flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/5"
              >
                <span>
                  {opt.label}
                  {opt.beta && <span className="ml-1 text-white/40">Beta</span>}
                </span>
                {lang === opt.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/75">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}
