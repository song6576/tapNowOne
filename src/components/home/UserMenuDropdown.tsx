/** 用户头像下拉：设置、语言、登出 */
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HoverDropdown } from '../ui/HoverDropdown'
import { UserMenuLanguageItem } from './UserMenuLanguageItem'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../store/langStore'

function UserAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl?: string | null; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-8 w-8 text-sm'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    )
  }
  const initial = name.trim()[0]?.toUpperCase() ?? 'U'
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 font-medium text-white`}>
      {initial}
    </span>
  )
}

export const UserMenuDropdown = memo(function UserMenuDropdown() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { t } = useI18n()
  const m = t.userMenu

  if (!user) return null

  const handleItem = (action?: string) => {
    if (action === 'logout') {
      logout()
      navigate('/login')
    }
  }

  const primaryItems = [
    { icon: '+', label: m.createTeam, accent: true },
    { icon: '👤', label: m.profile },
    { icon: '💎', label: m.earnTapies },
    { icon: '⚙', label: m.account },
  ]

  const secondaryItems = [
    { icon: '🤝', label: m.partners },
    { icon: '❓', label: m.help },
    { icon: '↪', label: m.logout, action: 'logout' as const },
  ]

  const panel = (
    <div className="user-menu-panel ui-glass-panel w-[280px] overflow-visible">
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
        </div>
      </div>

      <ul className="py-2">
        {primaryItems.slice(0, 2).map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => handleItem()}
              className="ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.04]"
            >
              <span className={item.accent ? 'text-blue-400' : 'text-white/50'}>{item.icon}</span>
              <span className={item.accent ? 'text-blue-400' : 'text-white/80'}>{item.label}</span>
            </button>
          </li>
        ))}

        <UserMenuLanguageItem />

        {primaryItems.slice(2).map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => handleItem()}
              className="ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.04]"
            >
              <span className={item.accent ? 'text-blue-400' : 'text-white/50'}>{item.icon}</span>
              <span className={item.accent ? 'text-blue-400' : 'text-white/80'}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/[0.06] py-2">
        {secondaryItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleItem(item.action)}
            className="ui-clickable flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span className="text-white/45">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <HoverDropdown
      align="right"
      panelClassName="overflow-visible"
      trigger={
        <button
          type="button"
          className="ui-glass-trigger ui-glass-trigger--pill flex items-center gap-2 py-1 pl-1 pr-3"
        >
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} />
          <span className="hidden max-w-[80px] truncate text-sm text-white/70 md:inline">
            {user.name.length > 8 ? `${user.name.slice(0, 8)}...` : user.name}
          </span>
        </button>
      }
    >
      {panel}
    </HoverDropdown>
  )
})
