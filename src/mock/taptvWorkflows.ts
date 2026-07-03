/**
 * TapTV 创作过程 Mock：为每个作品生成只读节点图快照
 */
import type { CanvasEdge, CanvasNode, CanvasProject } from '../types'

const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

export const DEFAULT_TAPTV_VIDEO = SAMPLE_VIDEO

function thumbSvg(label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},55%,28%)"/><stop offset="100%" stop-color="hsl(${(hue + 40) % 360},60%,18%)"/></linearGradient></defs><rect width="240" height="160" fill="url(#g)"/><text x="120" y="84" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-size="13" font-family="sans-serif">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** 生成分支型 image 节点网格，模拟真实创作流程 */
export function buildTapTVWorkflow(itemId: string, title: string, density: 'large' | 'medium' = 'medium'): CanvasProject {
  const labels = ['Image', '图片生成', '重绘', '后期处理']
  const cols = density === 'large' ? 9 : 6
  const rows = density === 'large' ? 5 : 4
  const nodes: CanvasNode[] = []
  const edges: CanvasEdge[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${itemId}-n-${r}-${c}`
      const label = labels[(r + c) % labels.length]
      nodes.push({
        id,
        type: 'image',
        position: { x: c * 210 + r * 36, y: r * 170 + (c % 2) * 24 },
        data: {
          label,
          prompt: `${title} · shot ${r + 1}-${c + 1}`,
          status: 'done',
          outputUrl: thumbSvg(label, (r * 47 + c * 19 + itemId.length * 5) % 360),
        },
      })
      if (c > 0) {
        edges.push({ id: `${id}-h`, source: `${itemId}-n-${r}-${c - 1}`, target: id })
      }
      if (r > 0 && c % 3 !== 2) {
        edges.push({ id: `${id}-v`, source: `${itemId}-n-${r - 1}-${c}`, target: id })
      }
    }
  }

  return {
    id: `workflow-${itemId}`,
    name: title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes,
    edges,
    viewport: { x: 40, y: 20, zoom: density === 'large' ? 0.32 : 0.42 },
  }
}

const WORKFLOW_CACHE = new Map<string, CanvasProject>()

export function getTapTVWorkflow(itemId: string, title: string, nodeCount = 12): CanvasProject {
  const cached = WORKFLOW_CACHE.get(itemId)
  if (cached) return cached
  const density = nodeCount >= 15 ? 'large' : 'medium'
  const project = buildTapTVWorkflow(itemId, title, density)
  WORKFLOW_CACHE.set(itemId, project)
  return project
}
