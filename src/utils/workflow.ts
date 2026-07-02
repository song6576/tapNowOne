/** 工作流拓扑排序与 Agent 画布上下文摘要 */
import type { CanvasNode, CanvasEdge } from '../types'

const GENERATABLE = new Set(['image', 'video', 'audio'])

/** 拓扑排序：返回可生成节点的执行顺序（上游先于下游） */
export function getWorkflowOrder(nodes: CanvasNode[], edges: CanvasEdge[]): string[] {
  const generatable = nodes.filter((n) => n.type && GENERATABLE.has(n.type))
  const ids = new Set(generatable.map((n) => n.id))

  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const id of ids) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) continue
    adj.get(e.source)!.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  }

  const queue = [...ids].filter((id) => inDegree.get(id) === 0)
  const order: string[] = []

  while (queue.length) {
    const cur = queue.shift()!
    order.push(cur)
    for (const next of adj.get(cur) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1
      inDegree.set(next, deg)
      if (deg === 0) queue.push(next)
    }
  }

  // 有环或未连通的节点追加到末尾
  for (const n of generatable) {
    if (!order.includes(n.id)) order.push(n.id)
  }

  return order
}

/** 构建画布摘要，供 Agent 感知 */
export function buildCanvasContext(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  if (!nodes.length) return '画布为空'
  const lines = nodes.map((n) => {
    const up = edges.filter((e) => e.target === n.id).map((e) => e.source)
    return `- [${n.type}] ${n.data.label} (id:${n.id.slice(0, 8)}) status:${n.data.status}${up.length ? ` ← ${up.length} inputs` : ''}`
  })
  return `${nodes.length} 节点, ${edges.length} 连线\n${lines.join('\n')}`
}
