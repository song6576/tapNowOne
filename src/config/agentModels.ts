/** @deprecated 使用 types/aiModel 与 useAiModels */
export {
  DEFAULT_AGENT_MODEL,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_AUDIO_MODEL,
  resolveAgentModel,
  resolveImageModel,
  resolveNodeModel,
  FALLBACK_AI_MODELS,
  type AiModel,
} from '../types/aiModel'

import { FALLBACK_AI_MODELS } from '../types/aiModel'

export type AiModelOption = {
  id: string
  label: string
  icon: string
}

export const AI_MODEL_OPTIONS: AiModelOption[] = FALLBACK_AI_MODELS.models.map((m) => ({
  id: m.slug,
  label: m.label,
  icon: m.icon,
}))
