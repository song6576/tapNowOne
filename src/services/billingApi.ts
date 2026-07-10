/**
 * 计费 API 统一入口（Mock ↔ 真实后端）
 * 接口说明见 backend-nest/docs/API.md
 */
import { USE_MOCK } from '../config'
import * as mock from '../mock/billing'
import * as real from '../api/client'

export type { BillingCycle, GiftPackMeta, PlanMeta } from '../api/client'

export const listBillingPlans = USE_MOCK ? mock.mockListBillingPlans : real.listBillingPlans
export const listGiftPacks = USE_MOCK ? mock.mockListGiftPacks : real.listGiftPacks
export async function getTeamBenefits(teamId?: string | null) {
  if (USE_MOCK) return mock.mockGetTeamBenefits(teamId)
  return real.getTeamBenefits(teamId)
}

export async function subscribePlan(payload: Parameters<typeof real.subscribePlan>[0]) {
  if (USE_MOCK) return mock.mockSubscribePlan(payload)
  return real.subscribePlan(payload)
}

export async function rechargeTapies(payload: Parameters<typeof real.rechargeTapies>[0]) {
  if (USE_MOCK) return mock.mockRechargeTapies(payload)
  return real.rechargeTapies(payload)
}

export async function purchaseGiftPack(id: string, teamId?: string) {
  if (USE_MOCK) return mock.mockPurchaseGiftPack(id)
  return real.purchaseGiftPack(id, teamId)
}

export async function listRedemptionHistory() {
  if (USE_MOCK) return mock.mockListRedemptionHistory()
  return real.listRedemptionHistory()
}

export async function redeemCode(payload: Parameters<typeof real.redeemCode>[0]) {
  if (USE_MOCK) return mock.mockRedeemCode(payload)
  return real.redeemCode(payload)
}

export async function generateRedemptionCode(payload: Parameters<typeof real.generateRedemptionCode>[0]) {
  if (USE_MOCK) return mock.mockGenerateRedemptionCode(payload)
  return real.generateRedemptionCode(payload)
}

export async function listBillingTransactions(params?: Parameters<typeof real.listBillingTransactions>[0]) {
  if (USE_MOCK) return mock.mockListBillingTransactions()
  return real.listBillingTransactions(params)
}

export { USE_MOCK }
