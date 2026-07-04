/**
 * 统一 API 入口 — 根据 config.USE_MOCK 在 mock 与真实后端间切换。
 * 组件层应优先 import 本文件，而非直接调用 api/client 或 mock/api。
 */
import { USE_MOCK } from '../config'
import * as mock from '../mock/api'
import * as real from '../api/client'

export const listProjects = USE_MOCK ? mock.mockListProjects : real.listProjects
export const getTapTV = USE_MOCK ? mock.mockGetTapTV : (() => Promise.reject(new Error('TapTV API 待接入')))
export const getTapTVItem = USE_MOCK ? mock.mockGetTapTVItem : (() => Promise.reject(new Error('TapTV API 待接入')))

/** Agent 对话：Mock 返回占位文案，真实模式走百炼 Qwen */
export async function agentChat(
  message: string,
  context?: string,
  conversationId?: string,
  model?: string,
  auto = true,
): Promise<{ reply: string; conversationId?: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      reply: `（Mock Agent）收到你的消息。当前画布上下文：\n${context?.slice(0, 200) ?? '空画布'}\n\n配置 VITE_USE_MOCK=false 并启动后端后可使用真实百炼对话。`,
    }
  }
  return real.agentChat(message, context, conversationId, model, auto)
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
