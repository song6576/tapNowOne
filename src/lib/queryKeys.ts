import type { TapTVListParams } from '../services/api'

/** React Query 缓存 key，避免魔法字符串散落各处 */
export const queryKeys = {
  home: {
    dashboard: ['home', 'dashboard'] as const,
    /** @deprecated 保留供 invalidate 兼容 */
    featured: ['home', 'featured'] as const,
    taptvPreview: ['home', 'taptv', { sort: 'featured' as const, limit: 8 }] as const,
  },
  taptv: {
    list: (params: TapTVListParams) => ['taptv', 'list', params] as const,
  },
}
