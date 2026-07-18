/** 画布节点尺寸与绝对坐标（打组 / 解组用） */
import type { CanvasNode, NodeType } from '../types'

const FALLBACK_SIZE: Record<NodeType, { w: number; h: number }> = {
  text: { w: 280, h: 180 },
  image: { w: 220, h: 200 },
  video: { w: 280, h: 200 },
  audio: { w: 260, h: 140 },
  group: { w: 320, h: 240 },
}

function parseSize(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

export function getNodeSize(node: CanvasNode): { w: number; h: number } {
  const fallback = FALLBACK_SIZE[node.type ?? 'image'] ?? FALLBACK_SIZE.image
  const w =
    node.measured?.width ??
    node.width ??
    parseSize(node.style?.width, fallback.w)
  const h =
    node.measured?.height ??
    node.height ??
    parseSize(node.style?.height, fallback.h)
  return { w, h }
}

/** 沿 parentId 链累加，得到画布绝对坐标 */
export function getAbsolutePosition(
  node: CanvasNode,
  nodesById: Map<string, CanvasNode>,
): { x: number; y: number } {
  let x = node.position.x
  let y = node.position.y
  let parentId = node.parentId
  const guard = new Set<string>()
  while (parentId && !guard.has(parentId)) {
    guard.add(parentId)
    const parent = nodesById.get(parentId)
    if (!parent) break
    x += parent.position.x
    y += parent.position.y
    parentId = parent.parentId
  }
  return { x, y }
}

export function buildNodesById(nodes: CanvasNode[]): Map<string, CanvasNode> {
  return new Map(nodes.map((n) => [n.id, n]))
}
