/** 上游节点输入解析：收集全部祖先 text / image（含间接连线） */
import type { CanvasNode, CanvasEdge, NodeType } from '../types'

export type UpstreamTextRef = {
  nodeId: string
  label: string
  text: string
}

export type UpstreamImageRef = {
  nodeId: string
  label: string
  url: string
}

/** BFS 遍历入边祖先，汇总全部 text / image（支持多路与间接引用） */
export function getUpstreamInputs(
  nodeId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): {
  upstreamText?: string
  upstreamTexts: UpstreamTextRef[]
  upstreamImageUrl?: string
  upstreamImageUrls: string[]
  upstreamImages: UpstreamImageRef[]
} {
  const upstreamTexts: UpstreamTextRef[] = []
  const upstreamImages: UpstreamImageRef[] = []
  const visited = new Set<string>([nodeId])
  const queue: string[] = [nodeId]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const edge of edges) {
      if (edge.target !== current) continue
      const source = nodes.find((n) => n.id === edge.source)
      if (!source || visited.has(source.id)) continue
      visited.add(source.id)
      queue.push(source.id)

      if (source.type === 'text') {
        const text = (source.data.outputText || source.data.prompt || '').trim()
        if (text) {
          upstreamTexts.push({
            nodeId: source.id,
            label: source.data.label || 'Text',
            text,
          })
        }
      }

      if (source.type === 'image' && source.data.outputUrl) {
        upstreamImages.push({
          nodeId: source.id,
          label: source.data.label || 'Image',
          url: source.data.outputUrl,
        })
      }
    }
  }

  const upstreamImageUrls = upstreamImages.map((item) => item.url)
  const upstreamText = upstreamTexts.map((item) => item.text).join('') || undefined

  return {
    upstreamText,
    upstreamTexts,
    upstreamImageUrl: upstreamImageUrls[0],
    upstreamImageUrls,
    upstreamImages,
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
    if (upstreamText && self) return `${upstreamText}${self}`
    return self || upstreamText || ''
  }

  if (node.type === 'text' && upstreamText && self) {
    return `${upstreamText}${self}`
  }

  return self
}

export function canGenerate(type: NodeType | undefined): type is 'image' | 'video' | 'audio' {
  return type === 'image' || type === 'video' || type === 'audio'
}
