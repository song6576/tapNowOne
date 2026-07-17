/** 将画布 DAG 解析为可渲染的视频、字幕与音频时间线 */
import type {
  ComposeAudioTrack,
  ComposeCaption,
  ComposeClip,
  ComposeTimeline,
} from '../api/client'
import type { CanvasEdge, CanvasNode } from '../types'
import { getWorkflowOrder } from './workflow'

function buildAdjacency(edges: CanvasEdge[]) {
  const forward = new Map<string, string[]>()
  const reverse = new Map<string, string[]>()
  for (const edge of edges) {
    forward.set(edge.source, [...(forward.get(edge.source) ?? []), edge.target])
    reverse.set(edge.target, [...(reverse.get(edge.target) ?? []), edge.source])
  }
  return { forward, reverse }
}

function canReach(
  from: string,
  to: string,
  adjacency: Map<string, string[]>,
): boolean {
  const queue = [from]
  const seen = new Set<string>()
  while (queue.length) {
    const current = queue.shift()!
    if (current === to) return true
    if (seen.has(current)) continue
    seen.add(current)
    queue.push(...(adjacency.get(current) ?? []))
  }
  return false
}

function graphDistance(
  from: string,
  to: string,
  adjacency: Map<string, string[]>,
): number {
  const queue: Array<{ id: string; distance: number }> = [{ id: from, distance: 0 }]
  const seen = new Set<string>()
  while (queue.length) {
    const current = queue.shift()!
    if (current.id === to) return current.distance
    if (seen.has(current.id)) continue
    seen.add(current.id)
    for (const next of adjacency.get(current.id) ?? []) {
      queue.push({ id: next, distance: current.distance + 1 })
    }
  }
  return Number.POSITIVE_INFINITY
}

function ancestorText(
  nodeId: string,
  nodeById: Map<string, CanvasNode>,
  reverse: Map<string, string[]>,
): string | undefined {
  const queue = [...(reverse.get(nodeId) ?? [])]
  const seen = new Set<string>()
  const texts: string[] = []
  while (queue.length) {
    const current = queue.shift()!
    if (seen.has(current)) continue
    seen.add(current)
    const node = nodeById.get(current)
    if (node?.type === 'text') {
      const value = String(node.data.outputText || node.data.prompt || '').trim()
      if (value && !texts.includes(value)) texts.push(value)
    }
    queue.push(...(reverse.get(current) ?? []))
  }
  return texts.length ? texts.join('\n') : undefined
}

/**
 * 每条分支优先使用最终视频；没有视频结果时才使用最终图片。
 * 输入视频的中间图片不会重复进入成片。
 */
export function collectComposeTimeline(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): ComposeTimeline {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const { forward, reverse } = buildAdjacency(edges)
  const videos = nodes.filter(
    (node) => node.type === 'video' && Boolean(node.data.outputUrl),
  )

  const terminalVideos = videos.filter(
    (video) =>
      !videos.some(
        (candidate) =>
          candidate.id !== video.id && canReach(video.id, candidate.id, forward),
      ),
  )

  const images = nodes.filter(
    (node) => node.type === 'image' && Boolean(node.data.outputUrl),
  )
  const fallbackImages = images.filter((image) => {
    const feedsVideo = videos.some((video) =>
      canReach(image.id, video.id, forward),
    )
    if (feedsVideo) return false
    return !images.some(
      (candidate) =>
        candidate.id !== image.id && canReach(image.id, candidate.id, forward),
    )
  })

  const selected = [...terminalVideos, ...fallbackImages]
  const selectedIds = new Set(selected.map((node) => node.id))
  const order = getWorkflowOrder(nodes, edges).filter((id) => selectedIds.has(id))
  for (const node of selected) {
    if (!order.includes(node.id)) order.push(node.id)
  }

  let cursor = 0
  const clips: ComposeClip[] = []
  const captions: ComposeCaption[] = []
  const segmentStart = new Map<string, number>()

  for (const id of order) {
    const node = nodeById.get(id)
    if (!node?.data.outputUrl || (node.type !== 'image' && node.type !== 'video')) {
      continue
    }
    const duration = Math.max(0.5, Number(node.data.duration) || 4)
    clips.push({
      node_id: node.id,
      url: node.data.outputUrl,
      type: node.type,
      duration,
    })
    segmentStart.set(node.id, cursor)
    const text = ancestorText(node.id, nodeById, reverse)
    if (text) {
      captions.push({ text, start: cursor, end: cursor + duration })
    }
    cursor += duration
  }

  const audio_tracks: ComposeAudioTrack[] = nodes
    .filter((node) => node.type === 'audio' && Boolean(node.data.outputUrl))
    .map((audio) => {
      const linked = order
        .map((segmentId) => ({
          segmentId,
          distance: Math.min(
            graphDistance(audio.id, segmentId, forward),
            graphDistance(segmentId, audio.id, forward),
          ),
        }))
        .filter((candidate) => Number.isFinite(candidate.distance))
        .sort((a, b) => a.distance - b.distance)[0]?.segmentId
      return {
        url: audio.data.outputUrl!,
        start: linked ? (segmentStart.get(linked) ?? 0) : 0,
        volume: Math.min(2, Math.max(0, Number(audio.data.volume) || 1)),
      }
    })

  return {
    clips,
    captions,
    audio_tracks,
    width: 1280,
    height: 720,
    fps: 30,
  }
}
