/** 首页精选轮播：横向 snap 滚动，封面图/渐变，有视频时悬停播放 */
import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeaturedItem } from '../../mock/data'
import { useI18n } from '../../store/langStore'

function featuredCoverStyle(cover: string): CSSProperties {
  if (/^https?:\/\//i.test(cover) || cover.startsWith('/')) {
    return {
      backgroundImage: `url("${cover.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#141418',
    }
  }
  return { background: cover }
}

const FeaturedCard = memo(function FeaturedCard({
  item,
  onClick,
}: {
  item: FeaturedItem
  onClick?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !item.videoUrl) return
    if (hovering) {
      void video.play().catch(() => undefined)
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [hovering, item.videoUrl])

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="home-featured-card snap-start ui-clickable text-left"
    >
      <div className="home-featured-cover" style={featuredCoverStyle(item.cover)}>
        {item.videoUrl && (
          <video
            ref={videoRef}
            className={`home-featured-video${hovering ? ' home-featured-video--active' : ''}`}
            src={item.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
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
    const left = Math.max(0, target.offsetLeft - 8)
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
