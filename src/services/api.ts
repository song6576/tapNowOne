/**
 * 统一 API 入口 — 根据 config.USE_MOCK 在 mock 与真实后端间切换。
 * 组件层应优先 import 本文件，而非直接调用 api/client 或 mock/api。
 */
import { USE_MOCK } from '../config'
import * as mock from '../mock/api'
import * as real from '../api/client'
import type { TapTVCategory, TapTVSort } from '../mock/data'
import { FALLBACK_AI_MODELS } from '../types/aiModel'

export const listProjects = USE_MOCK ? mock.mockListProjects : real.listProjects
export const getFeatured = USE_MOCK ? mock.mockGetFeatured : real.listFeatured
export const getHomeDashboard = USE_MOCK ? mock.mockGetHomeDashboard : real.fetchHomeDashboard
export const getTapTV = USE_MOCK
  ? mock.mockGetTapTV
  : (params?: real.TapTVListParams) => real.listTapTV(params)
export const getTapTVItem = USE_MOCK ? mock.mockGetTapTVItem : real.getTapTVItem
export const getTapTVWorkflow = USE_MOCK ? mock.mockGetTapTVWorkflow : real.getTapTVWorkflow

/**
 * 切换点赞。Mock：localStorage；真实：POST /api/taptv/:id/like
 * 返回 liked 用于点亮卡片/详情页图标。
 */
export async function toggleTapTVLike(id: string) {
  if (USE_MOCK) return mock.mockToggleTapTVLike(id)
  return real.toggleTapTVLike(id)
}

/**
 * 切换收藏。Mock：localStorage；真实：POST /api/taptv/:id/favorite
 * 个人主页「我的收藏」列表来自 listTapTVFavorites。
 */
export async function toggleTapTVFavorite(id: string) {
  if (USE_MOCK) return mock.mockToggleTapTVFavorite(id)
  return real.toggleTapTVFavorite(id)
}

/** 我的收藏列表。Mock：过滤 localStorage；真实：GET /api/taptv/favorites */
export async function listTapTVFavorites() {
  if (USE_MOCK) return mock.mockListTapTVFavorites()
  return real.listTapTVFavorites()
}

export async function recordTapTVShare(id: string) {
  if (USE_MOCK) return { shares: 0 }
  return real.recordTapTVShare(id)
}

export async function followTapTVUser(userId: number) {
  if (USE_MOCK) return { following: true }
  return real.followTapTVUser(userId)
}

export async function cloneTapTVWork(id: string) {
  if (USE_MOCK) throw new Error('Mock 模式下请使用本地克隆')
  return real.cloneTapTVWork(id)
}

export type { TapTVListParams } from '../api/client'
export type { TapTVCategory, TapTVSort }

/** Agent 对话：Mock 返回占位文案，真实模式走百炼 Qwen */
export async function agentChat(
  message: string,
  context?: string,
  conversationId?: string,
  projectId?: string,
  model?: string,
  auto = true,
): Promise<import('../api/client').AgentChatResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    const { parseLocalCreateIntent, summarizeActions } = await import('../utils/canvasActions')
    const actions = parseLocalCreateIntent(message)
    if (actions.length) {
      return {
        reply: summarizeActions(actions) || '已按你的要求创建节点。',
        actions,
      }
    }
    return {
      reply: `（Mock Agent）收到你的消息。当前画布上下文：\n${context?.slice(0, 200) ?? '空画布'}\n\n配置 VITE_USE_MOCK=false 并启动后端后可使用真实百炼对话。`,
    }
  }
  return real.agentChat(message, context, conversationId, projectId, model, auto)
}

export async function agentStoryboard(
  script: string,
  model?: string,
  auto = true,
) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    const parts = script.split(/[。！？\n]+/).filter(Boolean).slice(0, 5)
    return parts.map((p, i) => ({
      label: `Scene ${i + 1}`,
      prompt: p.slice(0, 80),
    }))
  }
  return real.agentStoryboard(script, model, auto)
}

/** 单节点生成：Mock 即时返回 SVG；真实模式 submit + poll */
export async function generateNode(payload: Parameters<typeof real.submitGenerate>[0]): Promise<string> {
  if (USE_MOCK) {
    const r = await mock.mockGenerate(payload)
    return r.result_url
  }
  const { task_id } = await real.submitGenerate(payload)
  const result = await real.pollTask(task_id)
  if (!result.result_url) throw new Error('未返回结果')
  return result.result_url
}

export async function composeVideo(clips: real.ComposeClip[], audioUrl?: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000))
    return '/static/outputs/mock-compose.mp4'
  }
  const { task_id } = await real.submitCompose(clips, audioUrl)
  const result = await real.pollTask(task_id)
  if (!result.result_url) throw new Error('合成失败')
  return result.result_url
}

export { USE_MOCK }

/** AI 模型目录；Mock 模式返回内置回退数据 */
export async function getAiModels(params?: { category?: string; node_type?: string }) {
  if (USE_MOCK) return Promise.resolve(FALLBACK_AI_MODELS)
  return real.fetchAiModels(params)
}
