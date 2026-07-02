/** 首页探索 TapTV 区块：4 列卡片网格 + 查看全部 */
import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TapTVItem } from '../../mock/data'
import { useI18n } from '../../store/langStore'
import { TapTVCard } from '../taptv/TapTVCard'

interface TapTVExploreSectionProps {
  items: TapTVItem[]
}

export const TapTVExploreSection = memo(function TapTVExploreSection({ items }: TapTVExploreSectionProps) {
  const navigate = useNavigate()
  const { t } = useI18n()

  if (items.length === 0) return null

  return (
    <section className="w-full">
      <div className="home-section-header">
        <h2 className="home-featured-heading">{t.home.exploreTapTV}</h2>
        <Link to="/taptv" className="text-sm text-white/40 transition hover:text-white/70">
          {t.home.viewAll}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 8).map((item) => (
          <TapTVCard key={item.id} item={item} onClick={() => navigate(`/taptv/${item.id}`)} />
        ))}
      </div>
    </section>
  )
})
