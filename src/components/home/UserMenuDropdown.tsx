/** 用户头像下拉：团队切换、Tapies 余额、创建团队、账户管理等 */
import { memo, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HoverDropdown } from '../ui/HoverDropdown'
import { UserMenuLanguageItem } from './UserMenuLanguageItem'
import { UserMenuHelpItem } from './UserMenuHelpItem'
import { UserMenuTeamItem } from './UserMenuTeamItem'
import { AccountSettingsModal } from '../account/AccountSettingsModal'
import { CreateTeamModal } from '../team/CreateTeamModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import { useTeamStore } from '../../store/teamStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-12 w-12 text-lg' : size === 'md' ? 'h-9 w-9 text-sm' : 'h-8 w-8 text-sm'
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${dim} shrink-0 rounded-full object-cover`} />
  }
  const initial = name.trim()[0]?.toUpperCase() ?? 'U'
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 font-medium text-white`}>
      {initial}
    </span>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-white/35">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const UserMenuDropdown = memo(function UserMenuDropdown({
  variant = 'header',
}: {
  variant?: 'header' | 'avatar'
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const initProfile = useProfileStore((s) => s.init)
  const openAccountModal = useProfileStore((s) => s.openAccountModal)
  const initTeam = useTeamStore((s) => s.init)
  const tapiesBalance = useTeamStore((s) => s.tapiesBalance)
  const openCreateTeamModal = useTeamStore((s) => s.openCreateTeamModal)
  const { t } = useI18n()
  const m = t.userMenu
  const logoutConfirm = t.account.logoutConfirm
  const showToast = useToastStore((s) => s.showToast)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => { initProfile() }, [initProfile])
  useEffect(() => {
    if (user?.name) initTeam(user.name)
  }, [user?.name, initTeam])
  useEffect(() => {
    setMenuOpen(false)
    setLogoutConfirmOpen(false)
  }, [location.pathname])

  if (!user) return null

  const isAvatar = variant === 'avatar'
  const submenuSide = isAvatar ? 'right' : 'left'

  const handleLogout = () => {
    setLogoutConfirmOpen(false)
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const goProfile = () => {
    setMenuOpen(false)
    navigate('/home/profile')
  }

  const openAccount = (nav: Parameters<typeof openAccountModal>[0] = 'personal') => {
    setMenuOpen(false)
    openAccountModal(nav)
  }

  const menuRow = (
    icon: ReactNode,
    label: string,
    onClick: () => void,
    opts?: { accent?: boolean; chevron?: boolean },
  ) => (
    <button
      type="button"
      onClick={onClick}
      className="ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.04]"
    >
      <span className={opts?.accent ? 'text-blue-400' : 'text-white/50'}>{icon}</span>
      <span className={`flex-1 ${opts?.accent ? 'text-blue-400' : 'text-white/80'}`}>{label}</span>
      {opts?.chevron && <ChevronRight />}
    </button>
  )

  const panel = (
    <div className="user-menu-panel w-[280px] overflow-visible">
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
        </div>

        <UserMenuTeamItem submenuSide={submenuSide} />

        <div className="user-menu-tapies mt-3 rounded-lg bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/50">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {tapiesBalance.toLocaleString()}
            </span>
            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">{m.freeBadge}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/40">
            <span>{m.unlimitedQuota}</span>
            <span>∞</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full rounded-full bg-sky-400" />
          </div>
        </div>
      </div>

      <ul className="py-2">
        <li>
          {menuRow(
            <span className="text-base leading-none">+</span>,
            m.createTeam,
            () => { setMenuOpen(false); openCreateTeamModal() },
            { accent: true },
          )}
        </li>
        <li>
          {menuRow(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" />
            </svg>,
            m.profile,
            goProfile,
          )}
        </li>
        <UserMenuLanguageItem submenuSide={submenuSide} />
        <li>
          {menuRow(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M20 12v8H4v-8M12 22V2M7 12l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>,
            m.earnTapies,
            () => openAccount('rewards'),
            { chevron: true },
          )}
        </li>
        <li>
          {menuRow(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
            </svg>,
            m.account,
            () => openAccount('personal'),
          )}
        </li>
      </ul>

      <div className="border-t border-white/[0.06] py-2">
        {menuRow(
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
          </svg>,
          m.partners,
          () => showToast({ type: 'info', message: m.partners }),
        )}
        <UserMenuHelpItem submenuSide={submenuSide} />
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          className="ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-white/45">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {m.logout}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <HoverDropdown
        align={isAvatar ? 'left' : 'right'}
        side={isAvatar ? 'right' : 'bottom'}
        mode={isAvatar ? 'click' : 'hover'}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        closeDelay={420}
        allowFlip={!isAvatar}
        className={isAvatar ? 'user-menu-trigger-wrap user-menu-trigger-wrap--canvas' : 'user-menu-trigger-wrap'}
        panelClassName={`overflow-visible !bg-transparent !border-0 !shadow-none !backdrop-blur-none${isAvatar ? ' user-menu-panel-wrap--canvas' : ''}`}
        trigger={
          isAvatar ? (
            <button type="button" className="canvas-float-avatar ui-clickable overflow-hidden p-0" aria-label={m.profile}>
              <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="md" />
            </button>
          ) : (
            <button
              type="button"
              className="user-menu-trigger ui-glass-trigger ui-glass-trigger--pill flex items-center gap-2 py-1.5 pl-1 pr-3"
            >
              <UserAvatar name={user.name} avatarUrl={user.avatar_url} />
              <span className="hidden max-w-[96px] truncate text-sm text-white/70 md:inline">
                {user.name.length > 10 ? `${user.name.slice(0, 10)}...` : user.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`hidden text-white/40 transition md:block ${menuOpen ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )
        }
      >
        {panel}
      </HoverDropdown>
      <AccountSettingsModal />
      <CreateTeamModal />
      <ConfirmDialog
        open={logoutConfirmOpen}
        title={logoutConfirm.title}
        message={logoutConfirm.message}
        confirmLabel={logoutConfirm.confirm}
        cancelLabel={logoutConfirm.cancel}
        danger
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )
})
