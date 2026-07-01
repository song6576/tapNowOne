/**
 * Mock API — 模拟异步请求，后续替换 api/client.ts 中的真实调用
 */
import { MOCK_PROJECTS, MOCK_TAPTV, MOCK_TASKS, MOCK_USER, type MockProject, type TapTVItem, type GenerationTask } from './data'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function mockGetUser() {
  await delay()
  return MOCK_USER
}

export async function mockListProjects(): Promise<MockProject[]> {
  await delay()
  return MOCK_PROJECTS
}

export async function mockGetTapTV(): Promise<TapTVItem[]> {
  await delay()
  return MOCK_TAPTV
}

export async function mockGetTapTVItem(id: string): Promise<TapTVItem | undefined> {
  await delay()
  return MOCK_TAPTV.find((t) => t.id === id)
}

export async function mockGetTasks(): Promise<GenerationTask[]> {
  await delay()
  return MOCK_TASKS
}

export async function mockGenerate(payload: unknown): Promise<{ result_url: string }> {
  await delay(1200)
  const p = payload as { node_type?: string; prompt?: string }
  const label = (p.prompt ?? 'mock').slice(0, 30).replace(/[<"&]/g, '')
  const color = p.node_type === 'video' ? '#fbbf24' : p.node_type === 'audio' ? '#34d399' : '#a78bfa'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#18181b"/><text x="256" y="240" text-anchor="middle" fill="${color}" font-size="14" font-family="sans-serif">${p.node_type ?? 'image'}</text><text x="256" y="280" text-anchor="middle" fill="#71717a" font-size="11" font-family="sans-serif">${label}</text></svg>`
  return { result_url: `data:image/svg+xml,${encodeURIComponent(svg)}` }
}
