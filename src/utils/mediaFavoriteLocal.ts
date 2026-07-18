/**
 * Mock 模式下画布素材收藏的本地持久化
 * Key：tapflow_media_favorites → MediaFavoriteMeta[]
 */
import type { MediaFavoriteMeta } from '../api/client'
import type { TapTVItem } from '../mock/data'
import { mapMediaFavoriteItem } from '../api/client'
import { generateUUID } from './uuid'

const KEY = 'tapflow_media_favorites'

function readList(): MediaFavoriteMeta[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as MediaFavoriteMeta[]
  } catch {
    /* ignore */
  }
  return []
}

function writeList(items: MediaFavoriteMeta[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listMediaFavoritesLocal(): TapTVItem[] {
  return readList().map(mapMediaFavoriteItem)
}

export function getMediaFavoriteStatusLocal(mediaUrl: string): { favorited: boolean; id?: string } {
  const row = readList().find((item) => item.media_url === mediaUrl)
  return row ? { favorited: true, id: row.id } : { favorited: false }
}

export function toggleMediaFavoriteLocal(payload: {
  mediaUrl: string
  mediaType: 'video' | 'image'
  title?: string
  coverUrl?: string
  projectId?: string
  nodeId?: string
}): { favorited: boolean; id: string } {
  const list = readList()
  const idx = list.findIndex((item) => item.media_url === payload.mediaUrl)
  if (idx >= 0) {
    const [removed] = list.splice(idx, 1)
    writeList(list)
    return { favorited: false, id: removed.id }
  }

  const created: MediaFavoriteMeta = {
    id: generateUUID(),
    media_url: payload.mediaUrl,
    media_type: payload.mediaType,
    title: payload.title ?? null,
    cover_url: payload.coverUrl ?? null,
    project_id: payload.projectId ?? null,
    node_id: payload.nodeId ?? null,
    created_at: new Date().toISOString(),
    favorited: true,
  }
  writeList([created, ...list])
  return { favorited: true, id: created.id }
}
