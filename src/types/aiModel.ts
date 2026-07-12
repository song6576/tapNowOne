/** AI 模型（与 GET /api/models 响应一致） */
export type AiModelCategory = 'text' | 'image' | 'video' | 'audio'

export type AiModel = {
  id: string
  slug: string
  label: string
  category: AiModelCategory
  description: string
  usage_hint: string | null
  icon: string
  tier: string | null
  is_premium: boolean
  is_coming_soon: boolean
  node_types: string[]
  sort_order: number
}

export type AiModelsResponse = {
  models: AiModel[]
  coming_soon: AiModel[]
  by_category: Record<AiModelCategory, AiModel[]>
  default_slug: string
  default_image_slug?: string
}

/** 画布节点类型 → 模型分类 */
export function nodeTypeToModelCategory(
  nodeType: string,
): AiModelCategory | undefined {
  if (nodeType === 'text') return 'text'
  if (nodeType === 'image') return 'image'
  if (nodeType === 'video') return 'video'
  if (nodeType === 'audio') return 'audio'
  return undefined
}

/** 离线回退数据（接口不可用时） */
export const FALLBACK_AI_MODELS: AiModelsResponse = {
  default_slug: 'qwen3.7-plus',
  default_image_slug: 'qwen-image-2.0-pro-2026-04-22',
  models: [
    {
      id: 'fb-1',
      slug: 'qwen3.7-plus',
      label: 'Qwen 3.7 Plus',
      category: 'text',
      description: '适合日常文案、脚本润色与多轮对话，响应快、中文表现稳定。',
      usage_hint: '推荐作为 Auto 默认文本模型。',
      icon: 'Q',
      tier: 'high',
      is_premium: false,
      is_coming_soon: false,
      node_types: ['text', 'image'],
      sort_order: 10,
    },
    {
      id: 'fb-2',
      slug: 'deepseek-v4-flash',
      label: 'DeepSeek V4 Flash',
      category: 'text',
      description: '适合快速推理、代码辅助与结构化输出，性价比高。',
      usage_hint: null,
      icon: 'D',
      tier: 'medium',
      is_premium: false,
      is_coming_soon: false,
      node_types: ['text', 'image'],
      sort_order: 20,
    },
    {
      id: 'fb-img',
      slug: 'qwen-image-2.0-pro-2026-04-22',
      label: 'qwen-image-2.0-pro',
      category: 'image',
      description: '通义万相图片生成/编辑满血版：高保真纹理、光影材质与多语言图内文字；支持文生图与指令编辑。',
      usage_hint: '对应百炼模型 ID qwen-image-2.0-pro-2026-04-22；列表展示为 qwen-image-2.0-pro。',
      icon: 'I',
      tier: 'high',
      is_premium: true,
      is_coming_soon: false,
      node_types: ['image'],
      sort_order: 10,
    },
    {
      id: 'fb-3',
      slug: 'happyhorse-1.0-video-edit',
      label: 'HappyHorse 1.0 Video Edit',
      category: 'video',
      description: '适合短视频片段生成、镜头拼接与画面风格统一。',
      usage_hint: '视频生成消耗较高，建议先预览再批量生成。',
      icon: 'H',
      tier: 'high',
      is_premium: true,
      is_coming_soon: false,
      node_types: ['video'],
      sort_order: 10,
    },
    {
      id: 'fb-4',
      slug: 'sambert-zhide-v1',
      label: 'Sambert Zhide V1',
      category: 'audio',
      description: '适合中文旁白、解说配音与口播稿朗读。',
      usage_hint: null,
      icon: 'S',
      tier: 'medium',
      is_premium: false,
      is_coming_soon: false,
      node_types: ['audio'],
      sort_order: 10,
    },
  ],
  coming_soon: [
    {
      id: 'fb-5',
      slug: 'gpt-5.6',
      label: 'GPT 5.6',
      category: 'text',
      description: '适合复杂任务编排、多镜头视频规划与长剧情推理。',
      usage_hint: '使用该模型可能会产生较高消耗。',
      icon: 'G',
      tier: 'high',
      is_premium: true,
      is_coming_soon: true,
      node_types: ['text', 'image'],
      sort_order: 100,
    },
    {
      id: 'fb-6',
      slug: 'gemini-3.1-pro',
      label: 'Gemini 3.1 Pro',
      category: 'text',
      description: '适合多模态理解、长文档分析与创意头脑风暴。',
      usage_hint: '即将开放，敬请期待。',
      icon: '✦',
      tier: 'high',
      is_premium: true,
      is_coming_soon: true,
      node_types: ['text', 'image'],
      sort_order: 110,
    },
  ],
  by_category: { text: [], image: [], video: [], audio: [] },
}

FALLBACK_AI_MODELS.by_category = {
  text: FALLBACK_AI_MODELS.models.filter((m) => m.category === 'text'),
  image: FALLBACK_AI_MODELS.models.filter((m) => m.category === 'image'),
  video: FALLBACK_AI_MODELS.models.filter((m) => m.category === 'video'),
  audio: FALLBACK_AI_MODELS.models.filter((m) => m.category === 'audio'),
}

export const DEFAULT_AGENT_MODEL = FALLBACK_AI_MODELS.default_slug
export const DEFAULT_IMAGE_MODEL =
  FALLBACK_AI_MODELS.default_image_slug ?? 'qwen-image-2.0-pro-2026-04-22'

export function resolveAgentModel(modelId?: string, autoEnabled = true): string {
  if (autoEnabled || !modelId) return DEFAULT_AGENT_MODEL
  return modelId
}

/** 图片节点模型解析：Auto 时使用默认图片模型 */
export function resolveImageModel(modelId?: string, autoEnabled = true): string {
  if (autoEnabled || !modelId) return DEFAULT_IMAGE_MODEL
  return modelId
}
