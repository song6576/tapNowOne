import type { CanvasNode, CanvasEdge } from '../types'
import { getWorkflowOrder } from './workflow'

export function collectComposeClips(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): { clips: { url: string; type: 'image' | 'video'; duration: number }[]; audioUrl?: string } {
  const mediaNodes = nodes.filter(
    (n) => (n.type === 'video' || n.type === 'image') && n.data.outputUrl,
  )
  const order = getWorkflowOrder(mediaNodes, edges)

  const clips = order
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is CanvasNode => !!n && !!n.data.outputUrl)
    .map((n) => ({
      url: n.data.outputUrl!,
      type: (n.type === 'image' ? 'image' : 'video') as 'image' | 'video',
      duration: n.data.duration ?? 4,
    }))

  const audioNode = nodes.find((n) => n.type === 'audio' && n.data.outputUrl)
  return { clips, audioUrl: audioNode?.data.outputUrl }
}
