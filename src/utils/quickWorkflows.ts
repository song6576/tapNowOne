import type { NodeData, NodeType } from '../types'

export type QuickWorkflowId =
  | 'textToVideo'
  | 'imageToVideo'
  | 'smartVideo'
  | 'mixVideo'
  | 'lyrics'

export type QuickWorkflowNode = {
  type: Exclude<NodeType, 'group'>
  x: number
  y: number
  data?: Partial<NodeData>
}

export type QuickWorkflowDefinition = {
  nodes: QuickWorkflowNode[]
  edges: Array<[sourceIndex: number, targetIndex: number]>
  focusIndex: number
}

/**
 * 快捷入口只描述工作流拓扑，不直接操作 Zustand。
 * 这样可以单测“文案承诺的流程”并复用于后续模板系统。
 */
export function buildQuickWorkflow(id: QuickWorkflowId): QuickWorkflowDefinition {
  switch (id) {
    case 'textToVideo':
      return {
        nodes: [
          { type: 'text', x: 0, y: 0, data: { label: 'Video brief' } },
          { type: 'video', x: 360, y: 0, data: { label: 'Text to video' } },
        ],
        edges: [[0, 1]],
        focusIndex: 0,
      }
    case 'imageToVideo':
      return {
        nodes: [
          { type: 'image', x: 0, y: 0, data: { label: 'Start frame' } },
          { type: 'video', x: 360, y: 0, data: { label: 'Image to video' } },
        ],
        edges: [[0, 1]],
        focusIndex: 0,
      }
    case 'smartVideo':
      return {
        nodes: [
          { type: 'text', x: 0, y: 0, data: { label: 'Creative brief' } },
          { type: 'image', x: 360, y: -80, data: { label: 'Key visual' } },
          { type: 'video', x: 720, y: -80, data: { label: 'Final shot' } },
          { type: 'audio', x: 360, y: 220, data: { label: 'Sound design' } },
        ],
        edges: [[0, 1], [0, 3], [1, 2], [3, 2]],
        focusIndex: 0,
      }
    case 'mixVideo':
      return {
        nodes: [
          { type: 'image', x: 0, y: -100, data: { label: 'Visual reference' } },
          { type: 'audio', x: 0, y: 190, data: { label: 'Audio reference' } },
          { type: 'video', x: 380, y: 30, data: { label: 'Mixed video' } },
        ],
        edges: [[0, 2], [1, 2]],
        focusIndex: 0,
      }
    case 'lyrics':
      return {
        nodes: [
          { type: 'text', x: 0, y: 0, data: { label: 'Lyrics' } },
          { type: 'audio', x: 360, y: 0, data: { label: 'Vocal track' } },
        ],
        edges: [[0, 1]],
        focusIndex: 0,
      }
  }
}
