/**
 * TapTV 列表卡片
 *
 * 封面与视频：
 * - 默认展示 item.cover（发布时上传的图片 URL，或 CSS 渐变占位）
 * - mouseenter：显示 video（item.videoUrl），muted + loop 自动播放
 * - mouseleave：暂停并重置，恢复封面
 *
 * 收藏：
 * - onFavorite 由父组件调用 services/api，更新 favoritedByMe
 * - 卡片信息层级与 TapTV 官方列表一致：作者、单行标题、收藏数
 */
import { memo, useRef, useState } from 'react'
import type { TapTVItem } from '../../types/taptv'
import { isTapTVCoverImage } from '../../utils/taptvCover'

interface TapTVCardProps {
  item: TapTVItem
  onClick?: () => void
  /** 保留详情/个人页调用兼容；官方列表卡只展示收藏入口 */
  onLike?: () => void
  onFavorite?: () => void
}

function FavoriteIcon({ active }: { active?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  )
}

export const TapTVCard = memo(function TapTVCard({ item, onClick, onFavorite }: TapTVCardProps) {
  const [hovering, setHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const coverIsImage = isTapTVCoverImage(item.cover)

  const handleEnter = () => {
    setHovering(true)
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play().catch(() => { /* autoplay blocked */ })
  }

  const handleLeave = () => {
    setHovering(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  return (
    <article
      className="taptv-card"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="taptv-card-cover taptv-card-cover--video">
        {coverIsImage ? (
          <img
            src={item.cover}
            alt=""
            className={`taptv-card-cover-img${hovering ? ' taptv-card-cover-img--hidden' : ''}`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`taptv-card-cover-fallback${hovering ? ' taptv-card-cover-fallback--hidden' : ''}`}
            style={{ background: item.cover }}
            aria-hidden
          />
        )}
        {item.videoUrl && (
          <video
            ref={videoRef}
            className={`taptv-card-video${hovering ? ' taptv-card-video--visible' : ''}`}
            src={item.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        )}
        <button type="button" className="taptv-card-hit ui-clickable" onClick={onClick} aria-label={item.title} />
        <div className="taptv-card-overlay">
          <span className="taptv-card-author">@{item.author}</span>
          <div className="taptv-card-meta-row">
            <h3 className="taptv-card-title">{item.title}</h3>
            <div className="taptv-card-actions flex shrink-0 items-center gap-1">
              <button
                type="button"
                className={`taptv-card-action ui-clickable${item.favoritedByMe ? ' taptv-card-action--fav-active' : ''}`}
                aria-label="favorite"
                onClick={(e) => {
                  e.stopPropagation()
                  onFavorite?.()
                }}
              >
                <FavoriteIcon active={item.favoritedByMe} />
                <span>{item.favorites}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
})
