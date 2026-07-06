/** 账户管理各子页面视图（订阅/充值/账单等） */
import { useEffect, useMemo, useRef, useState } from 'react'
import { listTeamMembers, removeTeamMember, uploadAvatar, updateUserProfile, type TeamMemberRow } from '../../api/client'
import { TeamInviteModal } from '../team/TeamInviteModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import type { User } from '../../utils/auth'
import { profileFieldsFromUser, type UserProfile } from '../../store/profileStore'
import type { Team } from '../../store/teamStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'

const MOCK_TRANSACTIONS = [
  { id: '2009514390054862848', time: '2026/07/02 22:07:00', type: '充值-通用Tapies', desc: 'Promotion code reward LK66-2601-82EEW2HMQ', operator: 'songhai220430@gmail.com', amount: '+6000', status: 'done' },
  { id: '2009514390054862847', time: '2026/07/02 21:30:00', type: '消费-通用Tapies', desc: 'TapNow Agent - kimi-2.6', operator: 'songhai220430@gmail.com', amount: '-3', status: 'done' },
  { id: '2009514390054862846', time: '2026/07/02 20:15:00', type: '充值-通用Tapies', desc: 'Welcome bonus', operator: 'songhai220430@gmail.com', amount: '+200', status: 'done' },
  { id: '2009514390054862845', time: '2026/07/02 18:00:00', type: '消费-通用Tapies', desc: 'Image generation', operator: 'songhai220430@gmail.com', amount: '-23', status: 'done' },
]

const MOCK_REWARDS = [
  { code: 'LK66-2601-82EEW2HMQ...', activity: '积分申请60刀*100张', time: '2026-07-02 22:07', points: '6000' },
]

export function PersonalSettingsView({
  user,
  profile,
}: {
  user: User
  profile: UserProfile
}) {
  const { t } = useI18n()
  const a = t.account
  const updateUser = useAuthStore((s) => s.updateUser)
  const showToast = useToastStore((s) => s.showToast)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const initial = user.name.trim()[0]?.toUpperCase() ?? 'U'

  const buildDraft = () => ({
    name: user.name,
    ...profileFieldsFromUser(user),
    bio: user.bio ?? profile.bio,
  })

  const [draft, setDraft] = useState(buildDraft)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(buildDraft())
  }, [user, profile.bio, profile.socialLink, profile.country, profile.city, profile.profession, profile.showJoinDate])

  const patchDraft = (patch: Partial<typeof draft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const handleAvatarPick = () => avatarInputRef.current?.click()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { user: nextUser } = await uploadAvatar(file)
      updateUser(nextUser)
      showToast({ type: 'success', message: a.personalProfile })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' })
    }
  }

  const handleSave = async () => {
    const name = draft.name.trim()
    if (!name) {
      showToast({ type: 'info', message: '用户名不能为空' })
      return
    }
    setSaving(true)
    try {
      const saved = await updateUserProfile({
        name,
        bio: draft.bio,
        socialLink: draft.socialLink,
        country: draft.country,
        city: draft.city,
        profession: draft.profession,
        showJoinDate: draft.showJoinDate,
      })
      updateUser(saved)
      showToast({ type: 'success', message: a.saveSuccess })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '保存失败' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-white">{a.personalProfile}</h2>
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
      <div className="mt-6 flex justify-center md:justify-start">
        <button type="button" onClick={handleAvatarPick} className="ui-clickable relative" title={t.profile.uploadAvatar}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-2xl font-medium text-white">{initial}</span>
          )}
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
      <div className="account-form mt-8 space-y-5">
        <label className="account-field">
          <span className="account-label">{a.username}<span className="text-red-400">*</span></span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => patchDraft({ name: e.target.value })}
            className="account-input"
          />
        </label>
        <label className="account-field">
          <span className="account-label">{a.bio}</span>
          <textarea value={draft.bio} onChange={(e) => patchDraft({ bio: e.target.value })} rows={4} className="account-input account-textarea" />
        </label>
        <label className="account-field">
          <span className="account-label">{a.social}</span>
          <input type="url" value={draft.socialLink} onChange={(e) => patchDraft({ socialLink: e.target.value })} placeholder={a.socialPlaceholder} className="account-input" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="account-field">
            <span className="account-label">{a.country}</span>
            <select value={draft.country} onChange={(e) => patchDraft({ country: e.target.value })} className="account-input account-select">
              <option value="">{a.countryPlaceholder}</option>
              <option value="CN">中国</option>
            </select>
          </label>
          <label className="account-field">
            <span className="account-label">{a.city}</span>
            <select value={draft.city} onChange={(e) => patchDraft({ city: e.target.value })} className="account-input account-select">
              <option value="">{a.cityPlaceholder}</option>
              <option value="beijing">北京</option>
            </select>
          </label>
        </div>
        <label className="account-field">
          <span className="account-label">{a.profession}</span>
          <input type="text" value={draft.profession} onChange={(e) => patchDraft({ profession: e.target.value })} placeholder={a.professionPlaceholder} className="account-input" />
        </label>
        <div className="account-toggle-row">
          <span className="account-label mb-0">{a.showJoinDate}</span>
          <button type="button" role="switch" aria-checked={draft.showJoinDate} onClick={() => patchDraft({ showJoinDate: !draft.showJoinDate })} className={`model-toggle ${draft.showJoinDate ? 'model-toggle--on' : ''}`}>
            <span className="model-toggle-knob" />
          </button>
        </div>
        <label className="account-field">
          <span className="account-label">{a.email}</span>
          <input type="email" value={user.email} readOnly className="account-input account-input--readonly" />
        </label>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="account-plan-subscribe ui-clickable mt-2 w-full max-w-[200px] disabled:opacity-50"
        >
          {saving ? '...' : a.save}
        </button>
      </div>
    </>
  )
}

export function SubscriptionView() {
  const { t } = useI18n()
  const v = t.accountViews.subscription
  const [cycle, setCycle] = useState<'monthly' | 'yearly' | 'enterprise'>('yearly')

  return (
    <div className="account-view-subscription">
      <h2 className="text-2xl font-semibold text-white">{v.title}</h2>
      <p className="mt-2 text-sm text-white/45">{v.subtitle}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="account-segment">
          {(['monthly', 'yearly', 'enterprise'] as const).map((id) => (
            <button key={id} type="button" onClick={() => setCycle(id)} className={`account-segment-btn ui-clickable ${cycle === id ? 'account-segment-btn--active' : ''}`}>
              {v.cycles[id]}
            </button>
          ))}
        </div>
        <span className="text-sm text-white/40">{v.currency}</span>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {v.plans.map((plan) => (
          <div key={plan.id} className={`account-plan-card ${plan.highlight ? 'account-plan-card--highlight' : ''}`}>
            {plan.badge && <span className="account-plan-badge">{plan.badge}</span>}
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">{plan.name}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{plan.price}</p>
            <p className="mt-1 text-xs text-white/35 line-through">{plan.original}</p>
            <p className="mt-4 text-xs leading-relaxed text-white/45 whitespace-pre-line">{plan.note}</p>
            <button type="button" className="account-plan-subscribe ui-clickable mt-6 w-full">{v.subscribe}</button>
          </div>
        ))}
      </div>
      <button type="button" className="ui-clickable mx-auto mt-8 flex items-center gap-1 text-sm text-white/45 hover:text-white/70">
        {v.viewBenefits}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  )
}

export function ModelMarketView() {
  const { t } = useI18n()
  const v = t.accountViews.modelMarket
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">{v.title}</h2>
      <p className="mt-2 text-sm text-white/45">{v.subtitle}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {v.cards.map((card) => (
          <div key={card.id} className="model-market-card" style={{ background: card.bg }}>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-white/90">{card.model}</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs text-white/70">{card.tier}</span>
            </div>
            <p className="mt-8 text-3xl font-bold text-white">{card.price}</p>
            <p className="mt-1 text-xs text-white/55">{card.tapies}</p>
            <button type="button" className="model-market-buy ui-clickable mt-6 w-full">{v.buyNow}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RechargeView({ user, balance }: { user: User; balance: number }) {
  const { t } = useI18n()
  const v = t.accountViews.recharge
  const [amount, setAmount] = useState(3000)
  const presets = [1000, 2000, 3000, 5000, 10000]
  const payUsd = Math.round(amount / 100)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-sm font-medium text-white">
            {user.name.trim()[0]?.toUpperCase() ?? 'U'}
          </span>
          <div>
            <p className="text-sm font-medium text-white">{user.name} <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/55">{v.freeBadge}</span></p>
            <p className="text-xs text-white/35">{user.email}</p>
          </div>
        </div>
        <p className="text-right text-sm text-white/45">{v.balanceLabel}<br /><span className="text-2xl font-semibold text-white">{balance.toLocaleString()}</span> Tapies</p>
      </div>
      <div className="recharge-card">
        <h3 className="text-base font-medium text-white">{v.title}</h3>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-3xl font-bold text-sky-400">{amount.toLocaleString()} Tapies</p>
            <input type="range" min={500} max={500000} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="recharge-slider mt-4 w-full" />
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="account-input mt-3" />
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => setAmount(p)} className={`recharge-preset ui-clickable ${amount === p ? 'recharge-preset--active' : ''}`}>{p.toLocaleString()}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-sm text-white/45">{v.getTapies}</p>
            <p className="text-2xl font-semibold text-sky-400">{amount.toLocaleString()}</p>
            <p className="mt-4 inline-block rounded bg-white/10 px-2 py-1 text-xs text-white/55">{v.rate}</p>
            <p className="mt-6 text-sm text-white/45">{v.payAmount}</p>
            <p className="text-3xl font-semibold text-white">${payUsd}</p>
            <button type="button" className="recharge-submit ui-clickable mt-6 w-full">{v.submit}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamBenefitsView({ team, balance }: { team?: Team; balance: number }) {
  const { t } = useI18n()
  const v = t.accountViews.teamBenefits
  return (
    <div className="space-y-4">
      <div className="account-benefit-row">
        <div><p className="font-medium text-white">{v.balanceTitle.replace('{n}', balance.toLocaleString())}</p><p className="mt-1 text-xs text-white/40">{v.balanceHint}</p></div>
        <button type="button" className="account-inline-btn ui-clickable">{v.recharge}</button>
      </div>
      <div className="account-benefit-row">
        <div><p className="font-medium text-white">{v.freePlan}</p><p className="mt-1 text-xs text-white/40">{v.upgradeHint}</p></div>
        <button type="button" className="account-inline-btn ui-clickable">{v.upgrade}</button>
      </div>
      <div className="account-benefit-row">
        <div>
          <p className="font-medium text-white">{v.yourTeam.replace('{name}', team?.name ?? '')}</p>
          <p className="mt-1 text-xs text-white/40">{v.teamId.replace('{id}', team?.teamId ?? '—')}</p>
        </div>
        <button type="button" className="account-inline-btn ui-clickable">{v.copyTeamId}</button>
      </div>
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-white/70">{v.quotaTitle}</h3>
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/35">{v.quotaEmpty}</div>
      </div>
    </div>
  )
}

export function RewardsView() {
  const { t } = useI18n()
  const v = t.accountViews.rewards
  const [code, setCode] = useState('')
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{v.title}</h2>
      <label className="mt-6 block text-sm text-white/45">{v.inputLabel}</label>
      <div className="mt-2 flex gap-2">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={v.inputPlaceholder} className="account-input flex-1" />
        <button type="button" className="account-inline-btn ui-clickable shrink-0">{v.redeem}</button>
      </div>
      <h3 className="mt-8 text-sm text-white/45">{v.historyTitle}</h3>
      <div className="account-table mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead><tr className="text-white/35">{v.columns.map((c) => <th key={c} className="px-3 py-2 font-normal">{c}</th>)}</tr></thead>
          <tbody>
            {MOCK_REWARDS.map((row) => (
              <tr key={row.code} className="border-t border-white/[0.06] text-white/75">
                <td className="px-3 py-3">{row.code}</td>
                <td className="px-3 py-3">{row.activity}</td>
                <td className="px-3 py-3">{row.time}</td>
                <td className="px-3 py-3 text-right">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function BillingView() {
  const { t } = useI18n()
  const v = t.accountViews.billing
  const [tab, setTab] = useState<'bills' | 'transactions'>('bills')

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="account-segment">
          <button type="button" onClick={() => setTab('bills')} className={`account-segment-btn ui-clickable ${tab === 'bills' ? 'account-segment-btn--active' : ''}`}>{v.tabBills}</button>
          <button type="button" onClick={() => setTab('transactions')} className={`account-segment-btn ui-clickable ${tab === 'transactions' ? 'account-segment-btn--active' : ''}`}>{v.tabTransactions}</button>
        </div>
        <button type="button" className="account-inline-btn ui-clickable">{v.feedback}</button>
      </div>

      {tab === 'bills' ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-medium text-white">{v.billsTitle}</h2>
            <button type="button" className="recharge-submit ui-clickable px-4 py-2 text-sm">{v.issueInvoice}</button>
          </div>
          <div className="account-table mt-4">
            <div className="grid grid-cols-5 gap-2 border-b border-white/[0.06] px-3 py-2 text-xs text-white/35">
              {v.billColumns.map((c) => <span key={c}>{c}</span>)}
            </div>
            <div className="flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-white/45">{v.billsEmpty}</p>
              <p className="mt-1 text-xs text-white/30">{v.billsEmptySub}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-table account-table--scroll mt-8">
          <div className="billing-tx-scroll">
            <table className="billing-tx-table">
              <thead>
                <tr>
                  {v.txColumns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((row) => (
                  <tr key={row.id}>
                    <td className="billing-tx-id">{row.id}</td>
                    <td>{row.time}</td>
                    <td>{row.type}</td>
                    <td className="billing-tx-desc" title={row.desc}>{row.desc}</td>
                    <td className="billing-tx-operator">{row.operator}</td>
                    <td className={`billing-tx-amount ${row.amount.startsWith('+') ? 'billing-tx-amount--pos' : 'billing-tx-amount--neg'}`}>
                      {row.amount}
                    </td>
                    <td>
                      <span className="billing-tx-status">{v.completed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function UsageView({ team }: { team?: Team }) {
  const { t, lang } = useI18n()
  const v = t.accountViews.usage
  const [mode, setMode] = useState<'total' | 'agent'>('total')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'cumulative'>('daily')
  const stats = [
    { value: '23', label: v.statTotal },
    { value: '23', label: v.statPeak },
    { value: '0.4', label: v.statWeekly },
    { value: '1', label: v.statActive },
    { value: '1', label: v.statStreak },
  ]
  const teamInitial = team?.initial ?? 'T'
  const teamName = team?.name ?? ''

  const monthLabels = useMemo(() => {
    const labels: string[] = []
    const start = 6
    for (let i = 0; i <= 12; i++) {
      const month = (start + i) % 12
      if (lang === 'zh') labels.push(`${month + 1}月`)
      else labels.push(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month])
    }
    return labels
  }, [lang])

  const heatmapCells = useMemo(() => {
    const cols = 53
    const rows = 7
    const cells: { level: number; week: number; day: number }[][] = []
    for (let w = 0; w < cols; w++) {
      const col: { level: number; week: number; day: number }[] = []
      for (let d = 0; d < rows; d++) {
        const active = w === 44 && d === 3
        col.push({ level: active ? 4 : 0, week: w, day: d })
      }
      cells.push(col)
    }
    return cells
  }, [])

  return (
    <div className="usage-view mx-auto max-w-[860px]">
      <div className="flex items-center gap-3">
        <span className="usage-team-badge flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/25 text-sm font-semibold text-sky-300">
          {teamInitial}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">{v.title}</h2>
          <p className="text-xs text-white/40">{v.subtitle.replace('{team}', teamName)}</p>
        </div>
      </div>

      <div className="account-segment mt-5 inline-flex">
        <button type="button" onClick={() => setMode('total')} className={`account-segment-btn ui-clickable ${mode === 'total' ? 'account-segment-btn--active' : ''}`}>{v.totalUsage}</button>
        <button type="button" onClick={() => setMode('agent')} className={`account-segment-btn ui-clickable ${mode === 'agent' ? 'account-segment-btn--active' : ''}`}>{v.agentUsage}</button>
      </div>

      <div className="usage-stats mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="usage-stat-card">
            <p className="text-2xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs leading-snug text-white/35">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="usage-activity mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white/80">{v.activityTitle}</h3>
          <div className="account-segment account-segment--sm">
            {(['daily', 'weekly', 'cumulative'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`account-segment-btn account-segment-btn--sm ui-clickable ${period === id ? 'account-segment-btn--active' : ''}`}
              >
                {v.periods[id]}
              </button>
            ))}
          </div>
        </div>

        <div className="usage-heatmap mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="usage-heatmap-grid">
            {heatmapCells.map((col, wi) => (
              <div key={wi} className="usage-heatmap-col">
                {col.map((cell) => (
                  <div
                    key={`${cell.week}-${cell.day}`}
                    className={`usage-heatmap-cell usage-heatmap-cell--${cell.level}`}
                    title={`${cell.week}w ${cell.day}d`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="usage-heatmap-months">
            {monthLabels.map((label, i) => (
              <span key={`${label}-${i}`} className="usage-heatmap-month">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamSettingsView({ user, team }: { user: User; team?: Team }) {
  const { t } = useI18n()
  const v = t.accountViews.teamSettings
  const showToast = useToastStore((s) => s.showToast)
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TeamMemberRow | null>(null)
  const [removing, setRemoving] = useState(false)

  const resolvedTeam = team?.isPersonal ? undefined : team
  const teamInitial = resolvedTeam?.initial ?? user.name.trim()[0]?.toUpperCase() ?? 'T'
  const teamName = resolvedTeam?.name ?? `${user.name}的团队`
  const teamId = resolvedTeam?.teamId ?? '—'
  const teamUuid = resolvedTeam?.id
  const canInvite = Boolean(resolvedTeam?.isOwner)

  const refreshMembers = () => {
    if (!teamUuid) return
    setLoading(true)
    void listTeamMembers(teamUuid)
      .then((res) => setMembers(res.members))
      .catch((err: unknown) => {
        showToast({
          type: 'info',
          message: err instanceof Error ? err.message : v.loadFailed,
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshMembers()
  }, [teamUuid, showToast, v.loadFailed])

  const copyTeamId = async () => {
    try {
      await navigator.clipboard.writeText(teamId)
      showToast({ type: 'success', message: v.copiedTeamId })
    } catch {
      showToast({ type: 'info', message: teamId })
    }
  }

  const q = query.trim().toLowerCase()
  const filteredMembers = useMemo(() => {
    if (!q) return members
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    )
  }, [members, q])

  const handleRemoveMember = () => {
    if (!teamUuid || !removeTarget) return
    setRemoving(true)
    void removeTeamMember(teamUuid, removeTarget.user_id)
      .then(() => {
        setMembers((prev) => prev.filter((m) => m.user_id !== removeTarget.user_id))
        setRemoveTarget(null)
        showToast({ type: 'success', message: v.removeSuccess })
      })
      .catch((err: unknown) => {
        showToast({
          type: 'info',
          message: err instanceof Error ? err.message : v.removeMember,
        })
      })
      .finally(() => setRemoving(false))
  }

  if (!resolvedTeam) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-white/35">
        {v.noTeam}
      </div>
    )
  }

  return (
    <div className="team-settings-view">
      {teamUuid && (
        <TeamInviteModal open={inviteOpen} teamId={teamUuid} onClose={() => setInviteOpen(false)} />
      )}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title={v.removeConfirmTitle}
        message={v.removeConfirmMessage.replace('{name}', removeTarget?.name ?? '')}
        confirmLabel={v.removeMember}
        cancelLabel={t.account.logoutConfirm.cancel}
        danger
        onCancel={() => !removing && setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
      />

      <div className="team-settings-header">
        <div className="relative shrink-0">
          <span className="team-settings-avatar">{teamInitial}</span>
          <span className="team-settings-avatar-edit">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-white">{teamName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/40">
            <span>{v.teamIdLabel.replace('{id}', teamId)}</span>
            <button type="button" onClick={copyTeamId} className="team-settings-copy ui-clickable" aria-label={v.copyTeamId}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">{v.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={refreshMembers} className="team-settings-icon-btn ui-clickable" aria-label="Refresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="team-settings-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={v.searchPlaceholder}
              className="team-settings-search-input"
            />
          </div>
          {canInvite && (
            <button type="button" onClick={() => setInviteOpen(true)} className="team-settings-invite ui-clickable">
              <span className="text-base leading-none">+</span>
              {v.inviteMember}
            </button>
          )}
        </div>
      </div>

      <div className="team-settings-table mt-6">
        <div className="team-settings-table-head">
          <span>{v.colMember}</span>
          <span className="flex items-center gap-1">
            {v.colUsage}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25">
              <path d="M7 15l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{v.colRole}</span>
        </div>

        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center text-sm text-white/35">…</div>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((m) => {
            const initial = m.name.trim()[0]?.toUpperCase() ?? 'U'
            const unlimited = m.quota_limit === null
            const usagePct = unlimited
              ? 0
              : m.quota_limit
                ? Math.min(100, (m.quota_used / m.quota_limit) * 100)
                : 0
            return (
              <div key={m.user_id} className="team-settings-member-row">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <span className="team-member-avatar">{initial}</span>
                    {m.role === 'owner' && (
                      <span className="team-member-crown">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 18l3-10 4 4 3-8 3 8 4-4 3 10H2z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {m.name} {m.is_self && <span className="text-white/45">{v.you}</span>}
                    </p>
                    <p className="truncate text-xs text-white/35">{m.email}</p>
                  </div>
                </div>
                <div className="team-member-usage">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{unlimited ? v.unlimitedQuota : `${m.quota_used} / ${m.quota_limit}`}</span>
                    <span>{unlimited ? '∞' : ''}</span>
                  </div>
                  <div className="team-member-usage-bar">
                    <div className="team-member-usage-fill" style={{ width: unlimited ? '0%' : `${usagePct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="team-member-role min-w-0 flex-1" defaultValue={m.role} disabled>
                    <option value="owner">{v.owner}</option>
                    <option value="member">{v.member}</option>
                  </select>
                  {canInvite && m.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(m)}
                      className="team-member-remove ui-clickable"
                      aria-label={v.removeMember}
                      title={v.removeMember}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex min-h-[120px] items-center justify-center text-sm text-white/35">{v.searchPlaceholder}</div>
        )}
      </div>
    </div>
  )
}

export function AgentTutorialsView() {
  const { t } = useI18n()
  const v = t.accountViews.agentTutorials

  return (
    <div className="agent-tutorials-view space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-white">{v.modelsTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/45">{v.modelsDesc}</p>
        <div className="agent-tutorial-table mt-6">
          <div className="agent-tutorial-table-head">
            <span>{v.modelName}</span>
            <span>{v.modelTask}</span>
          </div>
          {v.models.map((row) => (
            <div key={row.name} className="agent-tutorial-table-row agent-tutorial-table-row--2">
              <span className="font-medium text-white/90">{row.name}</span>
              <span className="text-white/55">{row.task}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">{v.consumptionTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/45">{v.consumptionDesc}</p>
        <div className="agent-tutorial-table mt-6">
          <div className="agent-tutorial-table-head agent-tutorial-table-head--3">
            <span>{v.taskType}</span>
            <span>{v.taskSuitable}</span>
            <span>{v.estimatedTapies}</span>
          </div>
          {v.tasks.map((row) => (
            <div key={row.type} className="agent-tutorial-table-row agent-tutorial-table-row--3">
              <span className="font-medium text-white/90">{row.type}</span>
              <span className="text-white/55">{row.suitable}</span>
              <span className="font-semibold text-white">{row.tapies}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function AccountPlaceholderView({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-sm text-white/35">{message}</div>
  )
}
