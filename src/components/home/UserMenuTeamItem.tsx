/** 用户菜单内团队切换 flyout */
import { useEffect, useRef, useState } from 'react'
import { useTeamStore } from '../../store/teamStore'
import { userMenuSubmenuFlyoutClass, type UserMenuSubmenuSide } from '../../utils/userMenuSubmenu'

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/35">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UserMenuTeamItem({ submenuSide = 'left' }: { submenuSide?: UserMenuSubmenuSide }) {
  const teams = useTeamStore((s) => s.teams)
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const switchTeam = useTeamStore((s) => s.switchTeam)
  const getActiveTeam = useTeamStore((s) => s.getActiveTeam)
  const [subOpen, setSubOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const active = getActiveTeam()
  const label = active?.name ?? ''

  const clearTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const handleEnter = () => { clearTimer(); setSubOpen(true) }
  const handleLeave = () => {
    clearTimer()
    closeTimer.current = window.setTimeout(() => setSubOpen(false), 200)
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <div className="relative mt-3" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`ui-clickable flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
          subOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-medium text-white/70">
          {active?.initial ?? 'T'}
        </span>
        <span className="min-w-0 flex-1 truncate text-white/75">{label}</span>
        <ChevronRight />
      </button>

      {subOpen && (
        <div
          className={userMenuSubmenuFlyoutClass(submenuSide)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="user-menu-submenu-panel dropdown-panel min-w-[220px] overflow-hidden py-1">
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => switchTeam(team.id)}
                className="ui-clickable flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-white/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-medium text-white/70">
                  {team.initial}
                </span>
                <span className="min-w-0 flex-1 truncate text-white/85">{team.name}</span>
                {team.id === activeTeamId && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-white/60">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
