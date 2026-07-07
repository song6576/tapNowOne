/**
 * Mock 模式下 TapTV 点赞/收藏的本地持久化
 *
 * 真实后端走 taptv_like / taptv_favorite 表；
 * VITE_USE_MOCK=true 时用 localStorage 模拟，刷新页面状态不丢失。
 *
 * Key：
 * - tapflow_taptv_likes     → 已点赞作品 id 列表
 * - tapflow_taptv_favorites → 已收藏作品 id 列表（mockListTapTVFavorites 据此过滤）
 */
const LIKE_KEY = 'tapflow_taptv_likes'
const FAV_KEY = 'tapflow_taptv_favorites'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
  return new Set()
}

function writeSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

export function readTapTVLikes(): Set<string> {
  return readSet(LIKE_KEY)
}

export function readTapTVFavorites(): Set<string> {
  return readSet(FAV_KEY)
}

/** 切换点赞，返回切换后是否已赞 */
export function toggleTapTVLikeLocal(id: string): boolean {
  const set = readTapTVLikes()
  const next = !set.has(id)
  if (next) set.add(id)
  else set.delete(id)
  writeSet(LIKE_KEY, set)
  return next
}

/** 切换收藏，返回切换后是否已藏 */
export function toggleTapTVFavoriteLocal(id: string): boolean {
  const set = readTapTVFavorites()
  const next = !set.has(id)
  if (next) set.add(id)
  else set.delete(id)
  writeSet(FAV_KEY, set)
  return next
}
