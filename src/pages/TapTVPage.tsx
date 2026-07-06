/** TapTV 列表：排序 Tab、分类 Pills、搜索、发布弹窗 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterPills } from '../components/ui/FilterPills'
import { TapTVCard } from '../components/taptv/TapTVCard'
import { PublishModal } from '../components/taptv/PublishModal'
import { TAPTV_CATEGORY_IDS, type TapTVCategory, type TapTVItem, type TapTVSort } from '../mock/data'
import { getTapTV } from '../services/api'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'
import { getToken } from '../utils/auth'

export function TapTVPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const tv = t.taptv
  const showToast = useToastStore((s) => s.showToast)
  const [items, setItems] = useState<TapTVItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<TapTVSort>('featured')
  const [category, setCategory] = useState<TapTVCategory>('all')
  const [search, setSearch] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => {
    if (sort === 'following' && !getToken()) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getTapTV({ sort, category, search })
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([])
          if (sort === 'following') {
            showToast({
              type: 'info',
              message: err instanceof Error ? err.message : tv.sortFollowing,
            })
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [sort, category, search, showToast, tv.sortFollowing])

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

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-white/35">
            {t.taptv.detail.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-white/35">
            {t.workspace.empty}
          </div>
        ) : (
          <div className="taptv-explore-grid">
            {items.map((item) => (
              <TapTVCard key={item.id} item={item} onClick={() => navigate(`/taptv/${item.id}`)} />
            ))}
          </div>
        )}
        </div>
      </div>

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </main>
  )
}
