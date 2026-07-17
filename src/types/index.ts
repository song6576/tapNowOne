/**
 * 画布领域类型：节点/边/项目结构，以及各节点类型的默认元数据。
 */
import type { Node, Edge, Viewport } from '@xyflow/react'
import {
  DEFAULT_AGENT_MODEL,
  DEFAULT_AUDIO_MODEL,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
} from './aiModel'
import {
  DEFAULT_VIDEO_DURATION,
  DEFAULT_VIDEO_RATIO,
  DEFAULT_VIDEO_RESOLUTION,
} from '../constants/videoParams'

/** 画布支持的节点种类 */
export type NodeType = 'text' | 'image' | 'video' | 'audio' | 'group'
export type NodeStatus = 'idle' | 'generating' | 'done' | 'error'

export interface NodeData {
  label: string
  prompt: string
  model?: string
  autoModel?: boolean
  outputUrl?: string
  outputText?: string
  status: NodeStatus
  errorMessage?: string
  duration?: number
  videoResolution?: string
  videoRatio?: string
  videoWatermark?: boolean
  [key: string]: unknown
}

export type CanvasNode = Node<NodeData, NodeType>
export type CanvasEdge = Edge

export interface CanvasProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  viewport: Viewport
}

export const NODE_META: Record<NodeType, { label: string; icon: string; color: string; description: string }> = {
  text: { label: 'Text', icon: 'T', color: 'var(--tn-node-text)', description: 'Script / Prompt' },
  image: { label: 'Image', icon: '🖼', color: 'var(--tn-node-image)', description: 'Text to Image' },
  video: { label: 'Video', icon: '🎬', color: 'var(--tn-node-video)', description: 'Image to Video' },
  audio: { label: 'Audio', icon: '🔊', color: 'var(--tn-node-audio)', description: 'TTS / Music' },
  group: { label: 'Group', icon: '▦', color: 'var(--tn-text-muted)', description: 'Group nodes' },
}

/** 新建节点时的默认 data 字段（含各类型默认模型） */
export function createDefaultNodeData(type: NodeType): NodeData {
  const meta = NODE_META[type]
  const model =
    type === 'image'
      ? DEFAULT_IMAGE_MODEL
      : type === 'video'
        ? DEFAULT_VIDEO_MODEL
        : type === 'audio'
          ? DEFAULT_AUDIO_MODEL
          : type === 'text'
            ? DEFAULT_AGENT_MODEL
            : undefined
  return {
    label: meta.label,
    prompt: '',
    status: 'idle',
    ...(model ? { model, autoModel: true } : {}),
    ...(type === 'video'
      ? {
          duration: DEFAULT_VIDEO_DURATION,
          videoResolution: DEFAULT_VIDEO_RESOLUTION,
          videoRatio: DEFAULT_VIDEO_RATIO,
          videoWatermark: false,
        }
      : {}),
  }
}
