/** 上游节点输入解析：从连线 source 收集 text 输出与 image URL */
import type { CanvasNode, CanvasEdge, NodeType } from '../types'

/** 遍历指向 nodeId 的入边，汇总上游 text/image 输出 */
export function getUpstreamInputs(
  nodeId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): {
  upstreamText?: string
  upstreamImageUrl?: string
  upstreamImageUrls: string[]
} {
  const incoming = edges.filter((e) => e.target === nodeId)
  let upstreamText: string | undefined
  const upstreamImageUrls: string[] = []

  for (const edge of incoming) {
    const source = nodes.find((n) => n.id === edge.source)
    if (!source) continue
    if (source.type === 'text') {
      upstreamText = source.data.outputText || source.data.prompt || upstreamText
    }
    if (source.type === 'image' && source.data.outputUrl) {
      upstreamImageUrls.push(source.data.outputUrl)
    }
  }

  return {
    upstreamText,
    upstreamImageUrl: upstreamImageUrls[0],
    upstreamImageUrls,
  }
}

/** 合并上游文本与节点自身 Prompt */
export function buildEffectivePrompt(
  node: CanvasNode,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): string {
  const { upstreamText } = getUpstreamInputs(node.id, nodes, edges)
  const self = node.data.prompt?.trim() ?? ''

  if (node.type === 'audio') {
    return upstreamText || self
  }

  if (node.type === 'image' || node.type === 'video') {
    if (upstreamText && self) return `${upstreamText}。${self}`
    return self || upstreamText || ''
  }

  return self
}

export function canGenerate(type: NodeType | undefined): type is 'image' | 'video' | 'audio' {
  return type === 'image' || type === 'video' || type === 'audio'
}
