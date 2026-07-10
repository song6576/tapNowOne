import { useQuery } from '@tanstack/react-query'
import { getAiModels } from '../services/api'
import { FALLBACK_AI_MODELS } from '../types/aiModel'
import type { AiModelCategory } from '../types/aiModel'

const STALE_MS = 10 * 60_000

export function useAiModels(params?: {
  category?: AiModelCategory
  nodeType?: string
}) {
  return useQuery({
    queryKey: ['ai-models', params?.category ?? 'all', params?.nodeType ?? 'all'],
    queryFn: async () => {
      try {
        return await getAiModels({
          category: params?.category,
          node_type: params?.nodeType,
        })
      } catch {
        return FALLBACK_AI_MODELS
      }
    },
    staleTime: STALE_MS,
    placeholderData: FALLBACK_AI_MODELS,
  })
}
