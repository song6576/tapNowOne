import { useQuery } from '@tanstack/react-query'
import { getAiModels } from '../services/api'
import type { AiModelCategory } from '../types/aiModel'

const STALE_MS = 10 * 60_000

export function useAiModels(params?: {
  category?: AiModelCategory
  nodeType?: string
}) {
  return useQuery({
    queryKey: ['ai-models', params?.category ?? 'all', params?.nodeType ?? 'all'],
    queryFn: () =>
      getAiModels({
        category: params?.category,
        node_type: params?.nodeType,
      }),
    staleTime: STALE_MS,
  })
}
