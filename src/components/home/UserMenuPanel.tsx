import { memo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_USER } from '../../mock/data'
import { useAuthStore } from '../../store/authStore'

interface UserMenuPanelProps {
  open: boolean
  onClose: () => void
}

const MENU_PRIMARY = [
  { icon: '+', label: '创建团队', accent: true },
  { icon: '👤', label: '个人主页' },
  { icon: '🌐', label: '简体中文' },
  { icon: '💎', label: '赚取 Tapies' },
  { icon: '⚙', label: '账户管理' },
]

const MENU_SECONDARY = [
  { icon: '🤝', label: '合作中心' },
  { icon: '❓', label: '帮助中心' },
  { icon: '↪', label: '登出账号', action: 'logout' as const },
]

export const UserMenuPanel = memo(function UserMenuPanel({ open, onClose }: UserMenuPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const handleItem = (action?: string) => {
    if (action === 'logout') {
      logout()
      navigate('/login')
    }
    onClose()
  }

  return (
    <div
      ref={ref}
      className="user-menu-panel absolute right-5 top-[calc(var(--tn-topbar-h)+8px)] z-40 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl md:right-8"
    >
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-lg font-medium text-white">
            海
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{MOCK_USER.name}</p>
            <p className="truncate text-xs text-white/40">{MOCK_USER.email}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.04] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">
              <span className="text-base font-semibold text-white">{MOCK_USER.credits}</span>{' '}
              {MOCK_USER.plan}
            </span>
            <span className="text-white/35">无额度限制 ∞</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
      </div>

      <ul className="py-2">
        {MENU_PRIMARY.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => handleItem()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.04]"
            >
              <span className={item.accent ? 'text-blue-400' : 'text-white/50'}>{item.icon}</span>
              <span className={item.accent ? 'text-blue-400' : 'text-white/80'}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/[0.06] py-2">
        {MENU_SECONDARY.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleItem(item.action)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span className="text-white/45">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
})
