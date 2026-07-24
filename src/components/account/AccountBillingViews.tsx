/**
 * 账户计费相关视图：订阅套餐、礼包超市、充值、团队权益、奖励中心、账单
 * 数据来自 GET/POST /api/billing/*。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '../../utils/auth'
import type { AccountNavId } from '../../store/profileStore'
import type { Team } from '../../store/teamStore'
import { PERSONAL_TEAM_ID, useTeamStore } from '../../store/teamStore'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import type { BillingCycle, EnterprisePlanMeta, GiftPackMeta, PlanMeta } from '../../api/client'
import {
  generateRedemptionCode,
  getTeamBenefits,
  listBillingPlans,
  listBillingTransactions,
  listGiftPacks,
  listRedemptionHistory,
  purchaseGiftPack,
  rechargeTapies,
  redeemCode,
  subscribePlan,
} from '../../services/billingApi'
import { EnterpriseMarquee } from './EnterpriseMarquee'
import { fetchOnce } from '../../utils/fetchOnce'

function resolveBenefitsTeamUuid(activeTeamId: string, teams: Team[]): string | undefined {
  if (activeTeamId !== PERSONAL_TEAM_ID) return activeTeamId
  return teams.find((t) => !t.isPersonal)?.id
}

function useRefreshBalance() {
  const user = useAuthStore((s) => s.user)
  const init = useTeamStore((s) => s.init)
  return useCallback(() => {
    if (user?.name) void init(user.name, { force: true })
  }, [init, user?.name])
}

function teamScopeId(activeTeamId?: string): string | undefined {
  if (!activeTeamId || activeTeamId === PERSONAL_TEAM_ID) return undefined
  return activeTeamId
}

export function SubscriptionView() {
  const { t } = useI18n()
  const v = t.accountViews.subscription
  const showToast = useToastStore((s) => s.showToast)
  const refreshBalance = useRefreshBalance()
  const activeTeamId = useTeamStore((s) => s.activeTeamId)

  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const [plans, setPlans] = useState<PlanMeta[]>([])
  const [enterprise, setEnterprise] = useState<EnterprisePlanMeta | null>(null)
  const [proTierIdx, setProTierIdx] = useState<Record<string, number>>({ pro: 1 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchOnce(`billing-plans:${cycle}`, () => listBillingPlans(cycle))
      .then((res) => {
        if (!cancelled) {
          setPlans(res.plans)
          setEnterprise(res.enterprise)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast({ type: 'info', message: err instanceof Error ? err.message : '加载失败' })
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [cycle])

  const handleSubscribe = async (plan: PlanMeta) => {
    if (cycle === 'enterprise') return
    setSubmitting(plan.slug)
    try {
      const proTapies =
        plan.slug === 'pro' && plan.pro_tiers
          ? plan.pro_tiers[proTierIdx.pro ?? 1]?.tapies
          : undefined
      const teamId = activeTeamId !== PERSONAL_TEAM_ID ? activeTeamId : undefined
      const res = await subscribePlan({
        plan_slug: plan.slug,
        cycle,
        pro_tapies: proTapies,
        team_id: teamId,
      })
      refreshBalance()
      showToast({ type: 'success', message: (res as { message?: string }).message ?? v.subscribe })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '订阅失败' })
    } finally {
      setSubmitting(null)
    }
  }

  const displayPlan = (plan: PlanMeta) => {
    if (plan.slug === 'pro' && plan.pro_tiers?.length) {
      const idx = proTierIdx.pro ?? 1
      const tier = plan.pro_tiers[idx] ?? plan.pro_tiers[1]
      return { ...plan, price_cny: tier.price_cny, original_cny: tier.original_cny, monthly_tapies: tier.tapies }
    }
    return plan
  }

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

      {loading ? (
        <div className="mt-12 text-center text-sm text-white/35">…</div>
      ) : cycle === 'enterprise' && enterprise ? (
        <div className="enterprise-plan-card mt-8">
          <div className="enterprise-plan-left">
            <p className="text-sm text-white/55">{enterprise.headline}</p>
            <h3 className="mt-4 text-4xl font-semibold text-white">{enterprise.name}</h3>
            <p className="mt-2 text-sm text-white/45">{enterprise.subtitle}</p>
            <EnterpriseMarquee logos={enterprise.partner_logos} />
          </div>
          <div className="enterprise-plan-right">
            <p className="text-sm font-medium text-white/70">定制套餐</p>
            <ul className="enterprise-plan-features mt-4 space-y-3">
              {enterprise.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-white/75">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-white/50">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="account-plan-subscribe ui-clickable mt-8 w-full"
              onClick={async () => {
                try {
                  const res = await subscribePlan({ plan_slug: 'enterprise', cycle: 'enterprise' })
                  showToast({ type: 'success', message: (res as { message?: string }).message ?? enterprise.contact_cta })
                } catch (err: unknown) {
                  showToast({ type: 'info', message: err instanceof Error ? err.message : '提交失败' })
                }
              }}
            >
              {enterprise.contact_cta}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {plans.map((raw) => {
            const plan = displayPlan(raw)
            return (
              <div key={plan.slug} className={`account-plan-card ${plan.highlight ? 'account-plan-card--highlight' : ''}`}>
                {plan.badge && <span className="account-plan-badge">{plan.badge}</span>}
                <p className="text-xs text-white/45">{plan.tagline}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/55">{plan.name}</p>
                <p className="mt-3 text-2xl font-semibold text-white">≈ ¥{plan.price_cny.toLocaleString()} <span className="text-sm font-normal text-white/45">/月</span></p>
                <p className="mt-1 text-xs text-white/35 line-through">¥{plan.original_cny.toLocaleString()}</p>
                <p className="mt-2 text-xs text-white/40">{plan.billing_note}</p>
                {raw.slug === 'pro' && raw.pro_tiers && (
                  <div className="pro-tier-slider mt-4">
                    <input
                      type="range"
                      min={0}
                      max={raw.pro_tiers.length - 1}
                      value={proTierIdx.pro ?? 1}
                      onChange={(e) => setProTierIdx({ pro: Number(e.target.value) })}
                      className="recharge-slider w-full"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-white/35">
                      {raw.pro_tiers.map((t) => (
                        <span key={t.tapies}>{t.label}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 space-y-2 rounded-lg bg-white/[0.04] p-3 text-xs text-white/55">
                  <p>每月积分: <span className="text-white/85">{plan.monthly_tapies.toLocaleString()} Tapies</span></p>
                  <p>额外充值: {plan.recharge_rate}</p>
                </div>
                <button
                  type="button"
                  disabled={submitting === plan.slug}
                  className="account-plan-subscribe ui-clickable mt-6 w-full disabled:opacity-50"
                  onClick={() => void handleSubscribe(raw)}
                >
                  {submitting === plan.slug ? '…' : v.subscribe}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ModelMarketView() {
  const { t } = useI18n()
  const v = t.accountViews.modelMarket
  const showToast = useToastStore((s) => s.showToast)
  const refreshBalance = useRefreshBalance()
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const [packs, setPacks] = useState<GiftPackMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchOnce('billing-gift-packs', () => listGiftPacks())
      .then((res) => { if (!cancelled) setPacks(res) })
      .catch(() => { if (!cancelled) setPacks([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleBuy = async (pack: GiftPackMeta) => {
    setBuying(pack.id)
    try {
      const teamId = activeTeamId !== PERSONAL_TEAM_ID ? activeTeamId : undefined
      const res = await purchaseGiftPack(pack.id, teamId)
      refreshBalance()
      setPacks((prev) =>
        prev.map((p) => (p.id === pack.id ? { ...p, stock_remaining: Math.max(0, p.stock_remaining - 1) } : p)),
      )
      showToast({ type: 'success', message: (res as { message?: string }).message ?? '购买成功' })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '购买失败' })
    } finally {
      setBuying(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">{v.title}</h2>
      <p className="mt-2 text-sm text-white/45">{v.subtitle}</p>
      {loading ? (
        <div className="mt-12 text-center text-sm text-white/35">…</div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packs.map((card) => (
            <div key={card.id} className="model-market-card" style={{ background: card.bg_gradient }}>
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-white/90">{card.model_name}</span>
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs text-white/70">{card.tier}</span>
              </div>
              <p className="mt-8 text-3xl font-bold text-white">{card.price_display}</p>
              <p className="mt-1 text-xs text-white/55">{card.tapies_label}</p>
              <button
                type="button"
                disabled={buying === card.id || card.stock_remaining <= 0}
                className="model-market-buy ui-clickable mt-6 w-full disabled:opacity-50"
                onClick={() => void handleBuy(card)}
              >
                {v.buyNow.replace('100/100', `${card.stock_remaining}/${card.stock_total}`)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RechargeView({ user, balance }: { user: User; balance: number }) {
  const { t } = useI18n()
  const v = t.accountViews.recharge
  const showToast = useToastStore((s) => s.showToast)
  const refreshBalance = useRefreshBalance()
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const [amount, setAmount] = useState(3000)
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [submitting, setSubmitting] = useState(false)
  const presets = [1000, 2000, 3000, 5000, 10000]
  const payUsd = Math.round(amount / 100)

  useEffect(() => { setDisplayBalance(balance) }, [balance])

  const handleRecharge = async () => {
    setSubmitting(true)
    try {
      const teamId = activeTeamId !== PERSONAL_TEAM_ID ? activeTeamId : undefined
      const res = await rechargeTapies({ tapies_amount: amount, team_id: teamId })
      setDisplayBalance((res as { tapies_balance?: number }).tapies_balance ?? displayBalance + amount)
      refreshBalance()
      showToast({ type: 'success', message: (res as { message?: string }).message ?? v.submit })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '充值失败' })
    } finally {
      setSubmitting(false)
    }
  }

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
        <p className="text-right text-sm text-white/45">{v.balanceLabel}<br /><span className="text-2xl font-semibold text-white">{displayBalance.toLocaleString()}</span> Tapies</p>
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
            <button type="button" disabled={submitting} className="recharge-submit ui-clickable mt-6 w-full disabled:opacity-50" onClick={() => void handleRecharge()}>
              {submitting ? '…' : v.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamBenefitsView({
  balance,
  onNavigate,
}: {
  balance: number
  onNavigate?: (nav: AccountNavId) => void
}) {
  const { t } = useI18n()
  const v = t.accountViews.teamSettings
  const vb = t.accountViews.teamBenefits
  const showToast = useToastStore((s) => s.showToast)
  const user = useAuthStore((s) => s.user)
  const init = useTeamStore((s) => s.init)
  const teams = useTeamStore((s) => s.teams)
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const [data, setData] = useState<Awaited<ReturnType<typeof getTeamBenefits>> | null>(null)
  const [loading, setLoading] = useState(true)

  const teamUuid = useMemo(
    () => resolveBenefitsTeamUuid(activeTeamId, teams),
    [activeTeamId, teams],
  )
  const displayTeam = useMemo(
    () => (teamUuid ? teams.find((t) => t.id === teamUuid) : undefined),
    [teamUuid, teams],
  )

  useEffect(() => {
    if (user?.name) void init(user.name)
  }, [user?.name, init])

  useEffect(() => {
    if (!teamUuid) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    void fetchOnce(`team-benefits:${teamUuid}`, () => getTeamBenefits(teamUuid))
      .then((res) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [teamUuid])

  const publicId = data?.public_id ?? displayTeam?.teamId ?? '—'
  const planName = data?.plan_name ?? vb.freePlan
  const bal = data?.tapies_balance ?? displayTeam?.tapiesBalance ?? balance
  const teamName = data?.name ?? displayTeam?.name ?? ''

  const copyTeamId = async () => {
    if (!publicId || publicId === '—') return
    try {
      await navigator.clipboard.writeText(publicId)
      showToast({ type: 'success', message: vb.copyTeamId })
    } catch {
      showToast({ type: 'info', message: publicId })
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-white/35">…</div>
  }

  if (!teamUuid) {
    return (
      <div className="space-y-4">
        <div className="account-benefit-row">
          <div>
            <p className="font-medium text-white">{vb.balanceTitle.replace('{n}', balance.toLocaleString())}</p>
            <p className="mt-1 text-xs text-white/40">{vb.balanceHint}</p>
          </div>
          <button type="button" className="account-inline-btn ui-clickable" onClick={() => onNavigate?.('recharge')}>{vb.recharge}</button>
        </div>
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 text-center">
          <p className="text-sm text-white/45">{v.noTeam}</p>
          <button type="button" className="account-inline-btn ui-clickable" onClick={() => onNavigate?.('team')}>{t.userMenu.createTeam}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="account-benefit-row">
        <div>
          <p className="font-medium text-white">{vb.balanceTitle.replace('{n}', bal.toLocaleString())}</p>
          <p className="mt-1 text-xs text-white/40">{vb.balanceHint}</p>
        </div>
        <button type="button" className="account-inline-btn ui-clickable" onClick={() => onNavigate?.('recharge')}>{vb.recharge}</button>
      </div>
      <div className="account-benefit-row">
        <div>
          <p className="font-medium text-white">{planName}</p>
          <p className="mt-1 text-xs text-white/40">{vb.upgradeHint}</p>
        </div>
        <button type="button" className="account-inline-btn ui-clickable" onClick={() => onNavigate?.('subscription')}>{vb.upgrade}</button>
      </div>
      <div className="account-benefit-row">
        <div>
          <p className="font-medium text-white">{vb.yourTeam.replace('{name}', teamName)}</p>
          <p className="mt-1 font-mono text-xs text-white/40">{vb.teamId.replace('{id}', publicId)}</p>
        </div>
        <button type="button" className="account-inline-btn ui-clickable" onClick={() => void copyTeamId()}>{vb.copyTeamId}</button>
      </div>
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-white/70">{vb.quotaTitle}</h3>
        {data?.quotas && data.quotas.length > 0 ? (
          <div className="space-y-2">
            {data.quotas.map((q) => (
              <div key={q.user_id} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70">
                <span className="text-white">{q.name}</span>
                <span className="ml-2 text-xs text-white/40">
                  {q.unlimited ? v.unlimitedQuota : `${q.quota_used} / ${q.quota_limit}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/35">{vb.quotaEmpty}</div>
        )}
      </div>
    </div>
  )
}

export function RewardsView() {
  const { t } = useI18n()
  const v = t.accountViews.rewards
  const showToast = useToastStore((s) => s.showToast)
  const refreshBalance = useRefreshBalance()
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const [code, setCode] = useState('')
  const [history, setHistory] = useState<Awaited<ReturnType<typeof listRedemptionHistory>>>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)

  const loadHistory = useCallback(() => {
    return listRedemptionHistory().then(setHistory)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchOnce('redemption-history', () => listRedemptionHistory())
      .then((res) => { if (!cancelled) setHistory(res) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleRedeem = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setRedeeming(true)
    try {
      const teamId = activeTeamId !== PERSONAL_TEAM_ID ? activeTeamId : undefined
      const res = await redeemCode({ code: trimmed, team_id: teamId })
      setCode('')
      refreshBalance()
      void loadHistory()
      showToast({ type: 'success', message: (res as { message?: string }).message ?? v.redeem })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '兑换失败' })
    } finally {
      setRedeeming(false)
    }
  }

  /** 临时：一键生成测试兑换码（后续会移除） */
  const handleDevGenerate = async () => {
    try {
      const res = await generateRedemptionCode({
        activity_name: '积分申请60刀*100张',
        tapies_amount: 6000,
        max_uses: 100,
      })
      const generated = (res as { code?: string }).code
      if (generated) {
        setCode(generated)
        showToast({ type: 'success', message: `已生成：${generated}` })
      }
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '生成失败' })
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{v.title}</h2>
      <label className="mt-6 block text-sm text-white/45">{v.inputLabel}</label>
      <div className="mt-2 flex gap-2">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={v.inputPlaceholder} className="account-input flex-1" />
        <button type="button" disabled={redeeming} className="account-inline-btn ui-clickable shrink-0 disabled:opacity-50" onClick={() => void handleRedeem()}>{v.redeem}</button>
      </div>
      <button type="button" className="mt-2 text-xs text-white/30 underline ui-clickable hover:text-white/50" onClick={() => void handleDevGenerate()}>
        [临时] 生成测试兑换码
      </button>
      <h3 className="mt-8 text-sm text-white/45">{v.historyTitle}</h3>
      <div className="account-table mt-3 overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-sm text-white/35">…</div>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead><tr className="text-white/35">{v.columns.map((c) => <th key={c} className="px-3 py-2 font-normal">{c}</th>)}</tr></thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-white/35">暂无兑换记录</td></tr>
              ) : history.map((row) => (
                <tr key={`${row.code}-${row.time}`} className="border-t border-white/[0.06] text-white/75">
                  <td className="px-3 py-3">{row.code}</td>
                  <td className="px-3 py-3">{row.activity}</td>
                  <td className="px-3 py-3">{row.time}</td>
                  <td className="px-3 py-3 text-right">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export function BillingTransactionsView() {
  const { t } = useI18n()
  const v = t.accountViews.billing
  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const [items, setItems] = useState<Awaited<ReturnType<typeof listBillingTransactions>>['items']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const teamId = teamScopeId(activeTeamId)
    const key = `billing-tx:${teamId ?? 'personal'}`
    void fetchOnce(key, () => listBillingTransactions({ team_id: teamId }))
      .then((res) => { if (!cancelled) setItems(res.items) })
      .catch(() => { if (!cancelled) setItems([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeTeamId])

  if (loading) {
    return <div className="py-12 text-center text-sm text-white/35">…</div>
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-white/45">{v.billsEmpty}</p>
        <p className="mt-1 text-xs text-white/30">{v.billsEmptySub}</p>
      </div>
    )
  }

  return (
    <div className="account-table account-table--scroll">
      <div className="billing-tx-scroll">
        <table className="billing-tx-table">
          <thead>
            <tr>{v.txColumns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td className="billing-tx-id">{row.id}</td>
                <td>{row.time}</td>
                <td>{row.type}</td>
                <td className="billing-tx-desc" title={row.desc}>{row.desc}</td>
                <td className="billing-tx-operator">{row.operator}</td>
                <td className={`billing-tx-amount ${row.amount.startsWith('+') ? 'billing-tx-amount--pos' : 'billing-tx-amount--neg'}`}>{row.amount}</td>
                <td><span className="billing-tx-status">{v.completed}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
