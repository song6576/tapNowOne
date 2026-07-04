/** 百炼 Agent 可选模型（与控制台「额度充沛模型」一致） */
export const DEFAULT_AGENT_MODEL = 'qwen-plus'

export type AiModelOption = {
  id: string
  label: string
  icon: string
}

function iconForModel(id: string): string {
  if (id.startsWith('qwen')) return 'Q'
  if (id.startsWith('deepseek')) return 'D'
  if (id.startsWith('glm')) return 'G'
  if (id.startsWith('kimi')) return 'K'
  return '·'
}

const MODEL_IDS = [
  'qwen3.7-plus',
  'deepseek-v4-flash',
  'qwen3.6-flash-2026-04-16',
  'qwen3.5-ocr',
  'qwen3.6-35b-a3b',
  'qwen3.7-max-2026-05-17',
  'qwen3.7-max-2026-06-08',
  'glm-5.1',
  'qwen3.7-max-preview',
  'qwen3.5-plus-2026-04-20',
  'qwen3.6-max-preview',
  'qwen3.7-max',
  'glm-5.2',
  'kimi-k2.7-code',
  'kimi-k2.6',
  'qwen3.7-max-2026-05-20',
  'qwen3.7-plus-2026-05-26',
  'qwen3.6-flash',
  'deepseek-v4-pro',
  'qwen3.6-27b',
] as const

export type AgentModelId = (typeof MODEL_IDS)[number]

export const AI_MODEL_OPTIONS: AiModelOption[] = MODEL_IDS.map((id) => ({
  id,
  label: id,
  icon: iconForModel(id),
}))

/** Auto 开启或未选手动模型时，使用 qwen-plus */
export function resolveAgentModel(modelId?: string, autoEnabled = true): string {
  if (autoEnabled || !modelId) return DEFAULT_AGENT_MODEL
  return modelId
}
