/** 首页探索 TapTV 区块：4 列卡片网格 + 查看全部 */
import { memo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TapTVItem } from '../../types/taptv'
import { toggleTapTVFavorite } from '../../services/api'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { getToken } from '../../utils/auth'
import { TapTVCard } from '../taptv/TapTVCard'

interface TapTVExploreSectionProps {
  items: TapTVItem[]
  onItemsChange?: (items: TapTVItem[]) => void
}

export const TapTVExploreSection = memo(function TapTVExploreSection({
  items,
  onItemsChange,
}: TapTVExploreSectionProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const showToast = useToastStore((s) => s.showToast)

  const patchItem = useCallback(
    (id: string, patch: Partial<TapTVItem>) => {
      onItemsChange?.(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [items, onItemsChange],
  )

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
      showToast({ type: 'info', message: err instanceof Error ? err.message : t.taptv.detail.loading })
    }
  }

  if (items.length === 0) return null

  return (
    <section className="w-full">
      <div className="home-section-header">
        <h2 className="home-featured-heading">{t.home.exploreTapTV}</h2>
        <Link to="/taptv" className="text-sm text-white/40 transition hover:text-white/70">
          {t.home.viewAll}
        </Link>
      </div>
      <div className="taptv-explore-grid">
        {items.slice(0, 8).map((item) => (
          <TapTVCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/taptv/${item.id}`)}
            onFavorite={() => void handleFavorite(item)}
          />
        ))}
      </div>
    </section>
  )
})
