/** 从 Agent / 本地意图解析画布操作，并应用到 canvasStore */
import type { NodeType } from '../types'
import { DEFAULT_IMAGE_MODEL, DEFAULT_AGENT_MODEL } from '../types/aiModel'

export type CanvasAddNodeAction = {
  type: 'add_node'
  node_type: 'text' | 'image' | 'video' | 'audio'
  label?: string
  prompt?: string
  count?: number
}

export type CanvasAction = CanvasAddNodeAction

const NODE_ALIASES: Record<string, CanvasAddNodeAction['node_type']> = {
  文本: 'text',
  文案: 'text',
  text: 'text',
  图片: 'image',
  图像: 'image',
  图: 'image',
  image: 'image',
  img: 'image',
  视频: 'video',
  video: 'video',
  音频: 'audio',
  语音: 'audio',
  audio: 'audio',
}

const COUNT_WORDS: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
}

/** 从用户话术里识别「创建/添加 xxx 节点」意图（不依赖 LLM） */
export function parseLocalCreateIntent(message: string): CanvasAction[] {
  const text = message.trim()
  if (!text) return []

  // 中文：创建两个图片节点 / 加一个视频节点，提示词是一只猫
  const zh =
    /(?:创建|添加|新建|加|放|帮我(?:创建|添加|新建)?)\s*(?:一个|1个|两个|2个|二个|三个|3个|四个|4个|五个|5个|六个|6个|\d+个|[一二两三四五六]个)?\s*(文本|文案|图片|图像|图|视频|音频|语音|text|image|img|video|audio)\s*(?:节点|node)?/i
  // 英文：create an image node / add two video nodes
  const en =
    /(?:create|add|make|new)\s+(?:an?\s+|one\s+|two\s+|three\s+|four\s+|five\s+|six\s+|\d+\s+)?(text|image|img|video|audio|图片|视频|文本|音频)\s*(?:nodes?|节点)?/i

  const m = text.match(zh) || text.match(en)
  if (!m) return []

  const nodeKey = m[1]
  const nodeType = NODE_ALIASES[nodeKey.toLowerCase()] ?? NODE_ALIASES[nodeKey]
  if (!nodeType) return []

  let count = 1
  const countMatch = text.match(
    /(?:一个|1个|两个|2个|二个|三个|3个|四个|4个|五个|5个|六个|6个|\d+个|[一二两三四五六]个|an?\s+|one\s+|two\s+|three\s+|four\s+|five\s+|six\s+|\d+\s+)/i,
  )
  if (countMatch) {
    const raw = countMatch[0].trim().toLowerCase()
    const digit = raw.match(/\d+/)
    if (digit) count = Math.min(6, Math.max(1, Number(digit[0])))
    else if (/^two\b/.test(raw) || raw.startsWith('两') || raw.startsWith('二')) count = 2
    else if (/^three\b/.test(raw) || raw.startsWith('三')) count = 3
    else if (/^four\b/.test(raw) || raw.startsWith('四')) count = 4
    else if (/^five\b/.test(raw) || raw.startsWith('五')) count = 5
    else if (/^six\b/.test(raw) || raw.startsWith('六')) count = 6
    else {
      const word = raw[0]
      count = COUNT_WORDS[word] ?? 1
    }
  }

  let prompt: string | undefined
  const promptMatch = text.match(/(?:提示词|prompt|内容)[是为:：\s]+(.+)$/i)
  if (promptMatch) prompt = promptMatch[1].trim()

  return [
    {
      type: 'add_node',
      node_type: nodeType,
      label: undefined,
      prompt,
      count,
    },
  ]
}

export function defaultModelForNode(nodeType: NodeType): string | undefined {
  if (nodeType === 'image') return DEFAULT_IMAGE_MODEL
  if (nodeType === 'text' || nodeType === 'video' || nodeType === 'audio') {
    return DEFAULT_AGENT_MODEL
  }
  return undefined
}

export function summarizeActions(actions: CanvasAction[]): string {
  if (!actions.length) return ''
  const parts = actions.map((a) => {
    if (a.type !== 'add_node') return ''
    const n = Math.min(6, Math.max(1, a.count ?? 1))
    const name =
      a.node_type === 'text'
        ? '文本'
        : a.node_type === 'image'
          ? '图片'
          : a.node_type === 'video'
            ? '视频'
            : '音频'
    return n > 1 ? `${n} 个${name}节点` : `1 个${name}节点`
  })
  return `已在画布上创建 ${parts.filter(Boolean).join('、')}。`
}
