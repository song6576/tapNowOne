/** 首页精选轮播：横向 snap 滚动，中间卡片放大，红条指示当前项 */
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeaturedItem } from '../../mock/data'
import { useI18n } from '../../store/langStore'

const FeaturedCard = memo(function FeaturedCard({
  item,
  isCenter,
  onClick,
}: {
  item: FeaturedItem
  isCenter?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`home-featured-card snap-center ui-clickable text-left ${isCenter ? 'home-featured-card--center' : ''}`}
    >
      <div className="home-featured-cover" style={{ background: item.cover }}>
        <div className="home-featured-overlay">
          <h3 className="home-featured-title">{item.title}</h3>
          {item.subtitle && <p className="home-featured-subtitle">{item.subtitle}</p>}
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
  const [activeIndex, setActiveIndex] = useState(0)

  /** 根据视口中心与卡片中心距离，判定当前「居中」项索引 */
  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el || items.length === 0) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.home-featured-card'))
    if (cards.length === 0) return
    const center = el.scrollLeft + el.clientWidth / 2
    let closest = 0
    let minDist = Infinity
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(center - cardCenter)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    })
    setActiveIndex(closest)
  }, [items.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateActiveIndex()
    el.addEventListener('scroll', updateActiveIndex, { passive: true })
    window.addEventListener('resize', updateActiveIndex)
    return () => {
      el.removeEventListener('scroll', updateActiveIndex)
      window.removeEventListener('resize', updateActiveIndex)
    }
  }, [updateActiveIndex, items])

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('.home-featured-card')
    const target = cards[index]
    if (!target) return
    const left = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2
    el.scrollTo({ left, behavior: 'smooth' })
  }, [])

  const go = useCallback((dir: -1 | 1) => {
    const next = Math.max(0, Math.min(items.length - 1, activeIndex + dir))
    scrollToIndex(next)
  }, [activeIndex, items.length, scrollToIndex])

  if (items.length === 0) return null

  return (
    <section className="home-featured-carousel">
      <h2 className="home-featured-heading">{t.home.featured}</h2>

      <div className="home-featured-stage">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={activeIndex <= 0}
          className="home-carousel-btn home-carousel-btn--prev ui-clickable"
          aria-label="上一项"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div ref={scrollRef} className="home-carousel-track">
          {items.map((item, i) => (
            <FeaturedCard
              key={item.id}
              item={item}
              isCenter={i === activeIndex}
              onClick={() => item.link && navigate(item.link)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={activeIndex >= items.length - 1}
          className="home-carousel-btn home-carousel-btn--next ui-clickable"
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
