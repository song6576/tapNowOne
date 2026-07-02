import { memo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeaturedItem } from '../../mock/data'
import { useI18n } from '../../store/langStore'

const FeaturedCard = memo(function FeaturedCard({ item, onClick }: { item: FeaturedItem; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="home-featured-card snap-start ui-clickable text-left"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 220px' }}
    >
      <div className="home-featured-cover" style={{ background: item.cover }}>
        <div className="home-featured-overlay">
          <h3 className="text-lg font-semibold text-white drop-shadow-md">{item.title}</h3>
          {item.subtitle && (
            <p className="mt-1 max-w-[240px] text-xs text-white/70">{item.subtitle}</p>
          )}
        </div>
      </div>
    </button>
  )
})

interface FeaturedCarouselProps {
  items: FeaturedItem[]
}

export const FeaturedCarousel = memo(function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useI18n()

  const scroll = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }, [])

  if (items.length === 0) return null

  return (
    <section className="relative mx-auto w-full max-w-[1200px]">
      <h2 className="mb-5 text-lg font-medium text-white">{t.home.featured}</h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="home-carousel-btn absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 md:flex"
          aria-label="上一项"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="home-carousel-track flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        >
          {items.map((item) => (
            <FeaturedCard
              key={item.id}
              item={item}
              onClick={() => item.link && navigate(item.link)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="home-carousel-btn absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:flex"
          aria-label="下一项"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  )
})
