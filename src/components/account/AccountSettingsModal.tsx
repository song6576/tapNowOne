/** 账户管理弹窗：左侧导航 + 各子页面视图 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Portal } from '../ui/Portal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import {
  AccountPlaceholderView,
  AgentTutorialsView,
  BillingView,
  ModelMarketView,
  PersonalSettingsView,
  RechargeView,
  RewardsView,
  SubscriptionView,
  TeamBenefitsView,
  TeamSettingsView,
  UsageView,
} from './AccountViews'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore, type AccountNavId } from '../../store/profileStore'
import { useTeamStore, PERSONAL_TEAM_ID } from '../../store/teamStore'
import { useI18n } from '../../store/langStore'

type NavItem = { id: AccountNavId; labelKey: AccountNavId | 'logout'; info?: boolean }

const NAV_GROUPS: { section: 'subscription' | 'benefits' | 'general' | 'support'; items: NavItem[] }[] = [
  {
    section: 'subscription',
    items: [
      { id: 'subscription', labelKey: 'subscription' },
      { id: 'modelMarket', labelKey: 'modelMarket', info: true },
      { id: 'recharge', labelKey: 'recharge' },
    ],
  },
  {
    section: 'benefits',
    items: [
      { id: 'teamBenefits', labelKey: 'teamBenefits' },
      { id: 'rewards', labelKey: 'rewards' },
      { id: 'billing', labelKey: 'billing' },
      { id: 'usage', labelKey: 'usage' },
    ],
  },
  {
    section: 'general',
    items: [
      { id: 'personal', labelKey: 'personal' },
      { id: 'team', labelKey: 'team', info: true },
    ],
  },
  {
    section: 'support',
    items: [
      { id: 'tutorials', labelKey: 'tutorials' },
      { id: 'agentTutorials', labelKey: 'agentTutorials' },
    ],
  },
]

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  )
}

export function AccountSettingsModal() {
  const open = useProfileStore((s) => s.accountModalOpen)
  const nav = useProfileStore((s) => s.accountNav)
  const profile = useProfileStore((s) => s.profile)
  const closeAccountModal = useProfileStore((s) => s.closeAccountModal)
  const setAccountNav = useProfileStore((s) => s.setAccountNav)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const tapiesBalance = useTeamStore((s) => s.tapiesBalance)
  const teams = useTeamStore((s) => s.teams)
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const getActiveTeam = useTeamStore((s) => s.getActiveTeam)

  const navigate = useNavigate()
  const { t } = useI18n()
  const a = t.account
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    if (!open) setLogoutConfirmOpen(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAccountModal() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, closeAccountModal])

  const activeTeam = getActiveTeam()
  const settingsTeam = useMemo(() => {
    if (activeTeamId !== PERSONAL_TEAM_ID) {
      return teams.find((t) => t.id === activeTeamId)
    }
    return teams.find((t) => !t.isPersonal)
  }, [teams, activeTeamId])

  if (!open || !user) return null

  const renderContent = () => {
    switch (nav) {
      case 'personal':
        return <PersonalSettingsView user={user} profile={profile} />
      case 'subscription':
        return <SubscriptionView />
      case 'modelMarket':
        return <ModelMarketView />
      case 'recharge':
        return <RechargeView user={user} balance={tapiesBalance} />
      case 'teamBenefits':
        return <TeamBenefitsView team={activeTeam} balance={tapiesBalance} />
      case 'rewards':
        return <RewardsView />
      case 'billing':
        return <BillingView />
      case 'usage':
        return <UsageView team={activeTeam} />
      case 'team':
        return <TeamSettingsView user={user} team={settingsTeam} />
      case 'agentTutorials':
        return <AgentTutorialsView />
      default:
        return <AccountPlaceholderView message={a.comingSoon} />
    }
  }

  const handleLogout = () => {
    closeAccountModal()
    logout()
    navigate('/login')
  }

  return (
    <>
    <Portal>
      <div className="account-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={closeAccountModal} aria-label="Close" />
        <div role="dialog" aria-modal="true" className="account-modal-panel account-modal-panel--wide relative z-10 flex w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <button
            type="button"
            onClick={closeAccountModal}
            className="account-modal-close ui-clickable absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <aside className="account-modal-sidebar shrink-0 overflow-y-auto border-r border-white/[0.06] p-4 md:w-[220px]">
            {NAV_GROUPS.map((group) => (
              <div key={group.section} className="mb-5">
                <p className="mb-2 px-3 text-xs text-white/30">{a.sections[group.section]}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setAccountNav(item.id)}
                        className={`account-nav-item ui-clickable ${nav === item.id ? 'account-nav-item--active' : ''}`}
                      >
                        <span>{a.nav[item.labelKey as keyof typeof a.nav]}</span>
                        {item.info && <InfoIcon />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-white/[0.06] pt-3">
              <p className="px-3 py-2 text-xs text-white/25">{a.version}</p>
              <button type="button" onClick={() => setLogoutConfirmOpen(true)} className="account-nav-item account-nav-item--danger ui-clickable w-full">
                {a.nav.logout}
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </Portal>
    <ConfirmDialog
      open={logoutConfirmOpen}
      title={a.logoutConfirm.title}
      message={a.logoutConfirm.message}
      confirmLabel={a.logoutConfirm.confirm}
      cancelLabel={a.logoutConfirm.cancel}
      danger
      onCancel={() => setLogoutConfirmOpen(false)}
      onConfirm={handleLogout}
    />
    </>
  )
}
