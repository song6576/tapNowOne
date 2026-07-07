/**
 * Mock API — 模拟异步请求，后续替换 api/client.ts 中的真实调用
 */
import {
  MOCK_FEATURED,
  MOCK_PROJECTS,
  MOCK_TAPTV,
  MOCK_TASKS,
  MOCK_USER,
  type FeaturedItem,
  type MockProject,
  type TapTVItem,
  type GenerationTask,
} from './data'
import type { CanvasProject } from '../types'
import { getTapTVWorkflow } from './taptvWorkflows'
import {
  readTapTVFavorites,
  readTapTVLikes,
  toggleTapTVFavoriteLocal,
  toggleTapTVLikeLocal,
} from '../utils/taptvLocalState'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/** Mock：为列表项附加 localStorage 中的 likedByMe / favoritedByMe */
function withLocalFlags(items: TapTVItem[]): TapTVItem[] {
  const likes = readTapTVLikes()
  const favs = readTapTVFavorites()
  return items.map((item) => ({
    ...item,
    likedByMe: likes.has(item.id),
    favoritedByMe: favs.has(item.id),
    likes: item.likes + (likes.has(item.id) ? 0 : 0),
  }))
}

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
  return withLocalFlags(MOCK_TAPTV)
}

/** Mock：GET /api/taptv/favorites — 从 MOCK_TAPTV 过滤已收藏 id */
export async function mockListTapTVFavorites(): Promise<TapTVItem[]> {
  await delay()
  const favs = readTapTVFavorites()
  return withLocalFlags(MOCK_TAPTV.filter((t) => favs.has(t.id)))
}

/** Mock：POST /api/taptv/:id/like */
export async function mockToggleTapTVLike(id: string) {
  await delay(120)
  const liked = toggleTapTVLikeLocal(id)
  const item = MOCK_TAPTV.find((t) => t.id === id)
  const base = item?.likes ?? 0
  return { liked, likes: liked ? base + 1 : Math.max(0, base - 1) }
}

/** Mock：POST /api/taptv/:id/favorite */
export async function mockToggleTapTVFavorite(id: string) {
  await delay(120)
  const favorited = toggleTapTVFavoriteLocal(id)
  const item = MOCK_TAPTV.find((t) => t.id === id)
  const base = item?.favorites ?? 0
  return { favorited, favorites: favorited ? base + 1 : Math.max(0, base - 1) }
}

export async function mockGetFeatured(): Promise<FeaturedItem[]> {
  await delay(200)
  return MOCK_FEATURED
}

export async function mockGetHomeDashboard(): Promise<{ featured: FeaturedItem[]; taptv: TapTVItem[] }> {
  await delay(200)
  const [featured, taptv] = await Promise.all([mockGetFeatured(), mockGetTapTV()])
  return { featured, taptv: taptv.slice(0, 8) }
}

export async function mockGetTapTVItem(id: string): Promise<TapTVItem | undefined> {
  await delay()
  const item = MOCK_TAPTV.find((t) => t.id === id)
  if (!item) return undefined
  const [mapped] = withLocalFlags([item])
  return mapped
}

export async function mockGetTapTVWorkflow(id: string): Promise<CanvasProject | undefined> {
  await delay()
  const item = MOCK_TAPTV.find((t) => t.id === id)
  if (!item) return undefined
  return getTapTVWorkflow(item.id, item.title, item.nodeCount)
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
