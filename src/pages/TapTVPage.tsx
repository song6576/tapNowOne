/** TapTV 列表：排序 Tab、分类 Pills、搜索、发布弹窗 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { FilterPills } from '../components/ui/FilterPills'
import { TapTVCard } from '../components/taptv/TapTVCard'
import { PublishModal } from '../components/taptv/PublishModal'
import { mockGetTapTV } from '../mock/api'
import { TAPTV_CATEGORY_IDS, type TapTVCategory, type TapTVItem, type TapTVSort } from '../mock/data'
import { useI18n } from '../store/langStore'

export function TapTVPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const tv = t.taptv
  const [items, setItems] = useState<TapTVItem[]>([])
  const [sort, setSort] = useState<TapTVSort>('featured')
  const [category, setCategory] = useState<TapTVCategory>('all')
  const [search, setSearch] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => { mockGetTapTV().then(setItems) }, [])

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

  /** 分类 → 搜索 → 排序 Tab 的链式筛选 */
  const filtered = useMemo(() => {
    let list = [...items]
    if (category !== 'all') {
      list = list.filter((item) => item.category === category)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (item) => item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q),
      )
    }
    switch (sort) {
      case 'featured':
        list.sort((a, b) => Number(b.featured) - Number(a.featured))
        break
      case 'hot':
        list.sort((a, b) => b.likes - a.likes)
        break
      case 'latest':
        list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case 'following':
        list = list.slice(0, 4)
        break
    }
    return list
  }, [items, sort, category, search])

  return (
    <main className="home-page flex-1 overflow-y-auto px-5 py-6 md:px-8">
      <div className="mx-auto max-w-[1200px]">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <TapTVCard key={item.id} item={item} onClick={() => navigate(`/taptv/${item.id}`)} />
          ))}
        </div>
      </div>

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </main>
  )
}
