/** 统一 API 入口：所有业务数据均来自真实后端/MySQL。 */
import * as real from '../api/client'
import type { TapTVCategory, TapTVSort } from '../types/taptv'

export const listProjects = real.listProjects
export const getFeatured = real.listFeatured
export const getHomeDashboard = real.fetchHomeDashboard
export const getTapTV = (params?: real.TapTVListParams) => real.listTapTV(params)
export const getTapTVItem = real.getTapTVItem
export const getTapTVWorkflow = real.getTapTVWorkflow
export const toggleTapTVLike = real.toggleTapTVLike
export const toggleTapTVFavorite = real.toggleTapTVFavorite
export const listTapTVFavorites = real.listTapTVFavorites
export const listMediaFavorites = real.listMediaFavorites
export const getMediaFavoriteStatus = real.getMediaFavoriteStatus
export const toggleMediaFavorite = real.toggleMediaFavorite
export const recordTapTVShare = real.recordTapTVShare
export const followTapTVUser = real.followTapTVUser
export const cloneTapTVWork = real.cloneTapTVWork
export const listProjectConversations = real.listProjectConversations
export const getConversation = real.getConversation
export const agentChat = real.agentChat
export const agentStoryboard = real.agentStoryboard
export const getAiModels = real.fetchAiModels

export type { TapTVListParams } from '../api/client'
export type { TapTVCategory, TapTVSort }

export async function listAllFavorites() {
  const [taptv, media] = await Promise.all([listTapTVFavorites(), listMediaFavorites()])
  const merged = [
    ...taptv.map((item) => ({ ...item, source: item.source ?? ('taptv' as const) })),
    ...media,
  ]
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export async function generateNode(
  payload: Parameters<typeof real.submitGenerate>[0],
): Promise<string> {
  const { task_id } = await real.submitGenerate(payload)
  const result = await real.pollTask(task_id)
  if (!result.result_url) throw new Error('未返回结果')
  return result.result_url
}

export async function composeVideo(timeline: real.ComposeTimeline): Promise<string> {
  const { task_id } = await real.submitCompose(timeline)
  const result = await real.pollTask(task_id)
  if (!result.result_url) throw new Error('合成失败')
  return result.result_url
}
