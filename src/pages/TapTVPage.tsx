/** TapTV 列表：排序 Tab、分类 Pills、搜索、发布弹窗 */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterPills } from '../components/ui/FilterPills'
import { TapTVCard } from '../components/taptv/TapTVCard'
import { OverlayLoading } from '../components/ui/RouteBoundary'
import { TAPTV_CATEGORY_IDS, type TapTVCategory, type TapTVItem, type TapTVSort } from '../mock/data'
import { toggleTapTVFavorite } from '../services/api'
import { useTapTVList } from '../hooks/useTapTVList'
import { queryKeys } from '../lib/queryKeys'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'
import { getToken } from '../utils/auth'

const PublishModal = lazy(() =>
  import('../components/taptv/PublishModal').then((module) => ({ default: module.PublishModal })),
)

export function TapTVPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const tv = t.taptv
  const showToast = useToastStore((s) => s.showToast)
  const [sort, setSort] = useState<TapTVSort>('featured')
  const [category, setCategory] = useState<TapTVCategory>('all')
  const [search, setSearch] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)

  const listParams = { sort, category, search }
  const { data: items = [], isLoading, isError, error, refetch } = useTapTVList(listParams)

  const sortTabs = [
    { id: 'featured' as const, label: tv.sortFeatured },
    { id: 'following' as const, label: tv.sortFollowing },
    { id: 'hot' as const, label: tv.sortHot },
    { id: 'latest' as const, label: tv.sortLatest },
  ]

  const categoryOptions = TAPTV_CATEGORY_IDS.map((id) => ({
    id,
    label: tv.categories[id],
  }))

  const patchItem = useCallback((id: string, patch: Partial<TapTVItem>) => {
    const key = queryKeys.taptv.list({ sort, category, search })
    queryClient.setQueryData<TapTVItem[]>(key, (prev) =>
      prev?.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }, [queryClient, sort, category, search])

  useEffect(() => {
    if (isError && sort === 'following') {
      showToast({
        type: 'info',
        message: error instanceof Error ? error.message : tv.sortFollowing,
      })
    }
  }, [isError, sort, error, showToast, tv.sortFollowing])

  const requireLogin = () => {
    if (getToken()) return true
    showToast({ type: 'info', message: t.login.title })
    navigate('/login')
    return false
  }

  const handleFavorite = async (item: TapTVItem) => {
    if (!requireLogin()) return
    try {
      const res = await toggleTapTVFavorite(item.id)
      patchItem(item.id, { favoritedByMe: res.favorited, favorites: res.favorites })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : tv.detail.loading })
    }
  }

  return (
    <main className="home-page taptv-page flex-1 overflow-y-auto">
      <div className="home-section-pad py-5 md:py-6">
        <div className="taptv-content">
          <div className="taptv-toolbar">
            <TabBar<TapTVSort> tabs={sortTabs} active={sort} onChange={setSort} />
            <div className="taptv-toolbar__actions">
              <SearchInput value={search} onChange={setSearch} placeholder={t.workspace.search} className="taptv-search" />
              <button type="button" className="taptv-publish-btn ui-clickable" onClick={() => setPublishOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                {tv.publish}
              </button>
            </div>
          </div>

          <FilterPills<TapTVCategory> options={categoryOptions} active={category} onChange={setCategory} className="taptv-category-bar" />

          {isLoading ? (
            <div className="taptv-list-skeleton" role="status" aria-label={t.taptv.detail.loading}>
              {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
            </div>
          ) : isError ? (
            <div className="taptv-list-state" role="alert">
              <strong>{t.taptv.detail.loadFailed}</strong>
              <button type="button" className="ui-clickable" onClick={() => void refetch()}>
                {t.taptv.detail.retry}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="taptv-list-state">
              <strong>{t.workspace.empty}</strong>
              <button type="button" className="ui-clickable" onClick={() => setPublishOpen(true)}>
                {t.taptv.publish}
              </button>
            </div>
          ) : (
            <div className="taptv-explore-grid">
              {items.map((item) => (
                <TapTVCard
                  key={item.id}
                  item={item}
                  onClick={() => navigate(`/taptv/${item.id}`)}
                  onFavorite={() => void handleFavorite(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {publishOpen && (
        <Suspense fallback={<OverlayLoading />}>
          <PublishModal
            open
            onClose={() => setPublishOpen(false)}
            onPublished={() => {
              setSort('latest')
              setPublishOpen(false)
              void queryClient.invalidateQueries({ queryKey: ['taptv'] })
              void queryClient.invalidateQueries({ queryKey: queryKeys.home.dashboard })
            }}
          />
        </Suspense>
      )}
    </main>
  )
}
