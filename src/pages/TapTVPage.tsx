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
import { toggleTapTVFavorite, toggleTapTVLike } from '../services/api'
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

  const handleLike = async (item: TapTVItem) => {
    if (!requireLogin()) return
    try {
      const res = await toggleTapTVLike(item.id)
      patchItem(item.id, { likedByMe: res.liked, likes: res.likes })
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : tv.detail.loading })
    }
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
    <main className="home-page flex-1 overflow-y-auto">
      <div className="home-section-pad py-6 md:py-8">
        <div className="home-wide-stack">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabBar<TapTVSort> tabs={sortTabs} active={sort} onChange={setSort} />
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder={t.workspace.search} className="w-full sm:w-[200px]" />
            <button type="button" className="home-primary-pill" onClick={() => setPublishOpen(true)}>
              + {tv.publish}
            </button>
          </div>
        </div>

        <FilterPills<TapTVCategory> options={categoryOptions} active={category} onChange={setCategory} className="mb-6" />

        {isLoading ? (
          <div className="taptv-list-skeleton" role="status" aria-label={t.taptv.detail.loading}>
            {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
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
                onLike={() => void handleLike(item)}
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
