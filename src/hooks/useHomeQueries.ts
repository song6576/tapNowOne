import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { getHomeDashboard } from '../services/api'

const STALE_HOME_DASHBOARD_MS = 2 * 60_000

/** 首页聚合：精选轮播 + TapTV 预览（单次 HTTP） */
export function useHomeDashboard() {
  return useQuery({
    queryKey: queryKeys.home.dashboard,
    queryFn: getHomeDashboard,
    staleTime: STALE_HOME_DASHBOARD_MS,
  })
}
