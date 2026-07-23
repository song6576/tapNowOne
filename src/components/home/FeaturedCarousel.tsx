/** 首页精选轮播：横向 snap 滚动，封面图/渐变，有视频时悬停播放 */
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeaturedItem } from '../../mock/data'
import { useI18n } from '../../store/langStore'

function isImageCover(cover: string) {
  return /^https?:\/\//i.test(cover) || cover.startsWith('/')
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
  const [playing, setPlaying] = useState(false)
  const coverIsImage = isImageCover(item.cover)

  const handleEnter = () => {
    setHovering(true)
    const video = videoRef.current
    if (!video || !item.videoUrl) return
    video.muted = true
    const play = video.play()
    if (play) {
      void play.then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const handleLeave = () => {
    setHovering(false)
    setPlaying(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  return (
    <article
      className="home-featured-card snap-start"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        className="home-featured-cover"
        style={coverIsImage ? undefined : { background: item.cover }}
      >
        {coverIsImage && (
          <img
            src={item.cover}
            alt=""
            className={`home-featured-cover-img${playing ? ' home-featured-cover-img--hidden' : ''}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            draggable={false}
          />
        )}
        {item.videoUrl && (
          <video
            ref={videoRef}
            className={`home-featured-video${playing ? ' home-featured-video--active' : ''}`}
            src={item.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            referrerPolicy="no-referrer"
            aria-hidden
          />
        )}
        <button
          type="button"
          className="home-featured-hit ui-clickable"
          onClick={onClick}
          aria-label={item.title}
        />
        <div className="home-featured-overlay">
          <h3 className="home-featured-title">{item.title}</h3>
          {item.subtitle && <p className="home-featured-subtitle">{item.subtitle}</p>}
        </div>
      </div>
    </article>
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
