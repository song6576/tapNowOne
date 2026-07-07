import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { getTapTV, type TapTVListParams } from '../services/api'
import { getToken } from '../utils/auth'

const STALE_TAPTV_MS = 2 * 60_000

export function useTapTVList(params: TapTVListParams) {
  const needsAuth = params.sort === 'following'
  const enabled = !needsAuth || !!getToken()

  return useQuery({
    queryKey: queryKeys.taptv.list(params),
    queryFn: () => getTapTV(params),
    enabled,
    staleTime: STALE_TAPTV_MS,
    placeholderData: needsAuth && !getToken() ? [] : undefined,
  })
}
