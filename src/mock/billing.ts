/**
 * Mock 计费 API — 无后端时本地模拟订阅/充值/兑换
 * 余额写入 localStorage tapflow_teams，与 teamStore 同步
 */
import type {
  BillingCycle,
  EnterprisePlanMeta,
  GiftPackMeta,
  PlanMeta,
  RedemptionRecordMeta,
  TransactionMeta,
} from '../api/client'

const TEAMS_KEY = 'tapflow_teams'
const REDEEM_KEY = 'tapflow_billing_redeems'
const CODES_KEY = 'tapflow_billing_codes'
const TX_KEY = 'tapflow_billing_tx'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

const ENTERPRISE: EnterprisePlanMeta = {
  slug: 'enterprise',
  name: 'Custom',
  headline: '我们帮助领先的创意团队在生成时代蓬勃发展。',
  subtitle: '企业级协作的明智之选',
  features: [
    '涵盖全部套餐权益',
    '可按需定制图像、视频、语音与音乐额度',
    '尊享最高优先级队列',
    '支持企业级模板定制',
    '多重数据安全保障',
    '支持成员用量精细化管控（天 / 周 / 月）',
    '支持账单明细查询与发票下载',
    '提供专属服务与响应',
  ],
  partner_logos: [
    { name: 'Kling', label: 'Kling' },
    { name: 'Luma', label: 'Luma' },
    { name: 'Sora', label: 'Sora' },
    { name: 'Midjourney', label: 'Midjourney' },
    { name: 'GPT Image', label: 'GPT Image' },
    { name: 'Seedance', label: 'Seedance' },
  ],
  contact_cta: '联系销售',
}

const MONTHLY_PLANS: PlanMeta[] = [
  { slug: 'basic', name: 'BASIC', tagline: '适合初次探索 AI 创作', price_cny: 63, original_cny: 105, billing_note: '按月支付，次月起 约 ¥105/月', monthly_tapies: 1500, recharge_rate: '¥7 = 100 Tapies', recharge_bonus_pct: 0 },
  { slug: 'pro', name: 'PRO', tagline: '适合高频创作与持续产出', price_cny: 357, original_cny: 420, billing_note: '按月支付', monthly_tapies: 6000, recharge_rate: '额外充值 赠10%', recharge_bonus_pct: 10, badge: '🔥 最受欢迎', highlight: true, pro_tiers: [{ tapies: 3500, label: '3.5k', price_cny: 210, original_cny: 280 }, { tapies: 6000, label: '6k', price_cny: 357, original_cny: 420 }] },
  { slug: 'ultimate', name: 'ULTIMATE', tagline: '适合大批量稳定产出', price_cny: 2142, original_cny: 2520, billing_note: '按月支付', monthly_tapies: 36000, recharge_rate: '赠20%', recharge_bonus_pct: 20 },
  { slug: 'max', name: 'MAX', tagline: '为极限产出而生', price_cny: 4284, original_cny: 5040, billing_note: '按月支付', monthly_tapies: 72000, recharge_rate: '赠30%', recharge_bonus_pct: 30, badge: '最佳性价比' },
]

const GIFT_PACKS: GiftPackMeta[] = [
  { id: 'gp1', model_name: 'Seedance 2.0', tier: '银卡', price_usd: 1000, price_display: '$1,000', tapies_amount: 140000, tapies_label: '140000 Seedance 2.0 Tapies', bg_gradient: 'linear-gradient(135deg,#1a3a2a 0%,#2d5a4a 100%)', stock_total: 100, stock_remaining: 100 },
  { id: 'gp2', model_name: 'Seedance 2.0', tier: '金卡', price_usd: 3000, price_display: '$3,000', tapies_amount: 450000, tapies_label: '450000 Seedance 2.0 Tapies', bg_gradient: 'linear-gradient(135deg,#3a1a4a 0%,#5a2d6a 100%)', stock_total: 100, stock_remaining: 100 },
  { id: 'gp3', model_name: 'Seedance 2.0', tier: '铂金卡', price_usd: 6000, price_display: '$6,000', tapies_amount: 1020000, tapies_label: '1020000 Seedance 2.0 Tapies', bg_gradient: 'linear-gradient(135deg,#1a2a4a 0%,#2d4a6a 100%)', stock_total: 100, stock_remaining: 100 },
]

type MockTeamsData = {
  teams: Array<{ id: string; name: string; teamId?: string; isPersonal?: boolean; tapiesBalance?: number }>
  activeTeamId: string
  tapiesBalance: number
}

function readTeamsData(): MockTeamsData | null {
  try {
    const raw = localStorage.getItem(TEAMS_KEY)
    if (raw) return JSON.parse(raw) as MockTeamsData
  } catch { /* ignore */ }
  return null
}

function readTeamsBalance(): number {
  return readTeamsData()?.tapiesBalance ?? 0
}

function addBalance(amount: number) {
  try {
    const raw = localStorage.getItem(TEAMS_KEY)
    const data = raw ? JSON.parse(raw) as { teams: unknown[]; activeTeamId: string; tapiesBalance: number } : { teams: [], activeTeamId: 'personal', tapiesBalance: 0 }
    data.tapiesBalance = (data.tapiesBalance ?? 0) + amount
    localStorage.setItem(TEAMS_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function pushTx(row: TransactionMeta) {
  try {
    const raw = localStorage.getItem(TX_KEY)
    const list = raw ? (JSON.parse(raw) as TransactionMeta[]) : []
    list.unshift(row)
    localStorage.setItem(TX_KEY, JSON.stringify(list.slice(0, 50)))
  } catch { /* ignore */ }
}

export async function mockListBillingPlans(cycle: BillingCycle) {
  await delay()
  if (cycle === 'enterprise') {
    return { cycle, plans: [] as PlanMeta[], enterprise: ENTERPRISE }
  }
  return { cycle, plans: MONTHLY_PLANS, enterprise: null }
}

export async function mockListGiftPacks() {
  await delay()
  return GIFT_PACKS
}

export async function mockGetTeamBenefits(teamId?: string | null) {
  await delay()
  const data = readTeamsData()
  if (data) {
    const realTeams = data.teams.filter((t) => !t.isPersonal)
    const target = teamId
      ? realTeams.find((t) => t.id === teamId)
      : data.activeTeamId !== 'personal'
        ? realTeams.find((t) => t.id === data.activeTeamId)
        : realTeams[0]
    if (target) {
      return {
        scope: 'team' as const,
        team_id: target.id,
        public_id: target.teamId ?? null,
        name: target.name,
        tapies_balance: target.tapiesBalance ?? 0,
        plan_slug: 'free',
        plan_name: '免费版',
        cycle: null,
        pro_tapies: null,
        quotas: [],
      }
    }
  }
  return {
    scope: 'personal' as const,
    team_id: null,
    public_id: null,
    name: '个人空间',
    tapies_balance: readTeamsBalance(),
    plan_slug: 'free',
    plan_name: '免费版',
    cycle: null,
    pro_tapies: null,
    quotas: [],
  }
}

export async function mockSubscribePlan(payload: { plan_slug: string; cycle: BillingCycle; pro_tapies?: number }) {
  await delay(300)
  if (payload.plan_slug === 'enterprise') {
    return { message: '已提交企业版咨询' }
  }
  const plan = MONTHLY_PLANS.find((p) => p.slug === payload.plan_slug)
  const tapies = payload.pro_tapies ?? plan?.monthly_tapies ?? 0
  addBalance(tapies)
  pushTx({ id: String(Date.now()), time: new Date().toLocaleString(), type: '订阅-通用Tapies', desc: `订阅 ${payload.plan_slug}`, operator: 'mock@local', amount: `+${tapies}`, status: 'done' })
  return { message: '订阅成功（Mock）', tapies_balance: readTeamsBalance(), monthly_tapies: tapies }
}

export async function mockRechargeTapies(payload: { tapies_amount: number }) {
  await delay(300)
  addBalance(payload.tapies_amount)
  pushTx({ id: String(Date.now()), time: new Date().toLocaleString(), type: '充值-通用Tapies', desc: `充值 ${payload.tapies_amount} Tapies`, operator: 'mock@local', amount: `+${payload.tapies_amount}`, status: 'done' })
  return { tapies_credited: payload.tapies_amount, tapies_balance: readTeamsBalance(), message: '充值成功（Mock）' }
}

export async function mockPurchaseGiftPack(id: string) {
  await delay(300)
  const pack = GIFT_PACKS.find((p) => p.id === id)
  if (!pack) throw new Error('礼包不存在')
  addBalance(pack.tapies_amount)
  return { tapies_credited: pack.tapies_amount, tapies_balance: readTeamsBalance(), message: '购买成功（Mock）' }
}

export async function mockListRedemptionHistory(): Promise<RedemptionRecordMeta[]> {
  await delay()
  try {
    const raw = localStorage.getItem(REDEEM_KEY)
    if (raw) return JSON.parse(raw) as RedemptionRecordMeta[]
  } catch { /* ignore */ }
  return []
}

export async function mockRedeemCode(payload: { code: string }) {
  await delay(300)
  const code = payload.code.trim().toUpperCase()
  let codes: Record<string, { activity: string; points: number; uses: number; max: number }> = {}
  try {
    const raw = localStorage.getItem(CODES_KEY)
    if (raw) codes = JSON.parse(raw)
  } catch { /* ignore */ }
  const entry = codes[code]
  if (!entry) throw new Error('兑换码无效')
  if (entry.uses >= entry.max) throw new Error('兑换码已达上限')
  entry.uses += 1
  codes[code] = entry
  localStorage.setItem(CODES_KEY, JSON.stringify(codes))
  addBalance(entry.points)
  const record: RedemptionRecordMeta = { code: `${code.slice(0, 12)}...`, activity: entry.activity, time: new Date().toISOString().slice(0, 16).replace('T', ' '), points: entry.points }
  const history = await mockListRedemptionHistory()
  history.unshift(record)
  localStorage.setItem(REDEEM_KEY, JSON.stringify(history))
  pushTx({ id: String(Date.now()), time: new Date().toLocaleString(), type: '充值-通用Tapies', desc: `Promotion code ${code}`, operator: 'mock@local', amount: `+${entry.points}`, status: 'done' })
  return { tapies_credited: entry.points, tapies_balance: readTeamsBalance(), message: '兑换成功' }
}

export async function mockGenerateRedemptionCode(payload: { activity_name: string; tapies_amount: number; max_uses?: number }) {
  await delay(200)
  const code = `TAP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  let codes: Record<string, { activity: string; points: number; uses: number; max: number }> = {}
  try {
    const raw = localStorage.getItem(CODES_KEY)
    if (raw) codes = JSON.parse(raw)
  } catch { /* ignore */ }
  codes[code] = { activity: payload.activity_name, points: payload.tapies_amount, uses: 0, max: payload.max_uses ?? 1 }
  localStorage.setItem(CODES_KEY, JSON.stringify(codes))
  return { code, activity_name: payload.activity_name, tapies_amount: payload.tapies_amount, message: '兑换码已生成（Mock）' }
}

export async function mockListBillingTransactions() {
  await delay()
  try {
    const raw = localStorage.getItem(TX_KEY)
    if (raw) return { total: 0, page: 1, items: JSON.parse(raw) as TransactionMeta[] }
  } catch { /* ignore */ }
  return { total: 0, page: 1, items: [] as TransactionMeta[] }
}
