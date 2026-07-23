/** TapTV 详情：紧凑视频 + 首屏作者信息 + 悬浮返回 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TapTVItem } from '../mock/data'
import {
  followTapTVUser,
  getTapTVItem,
  recordTapTVShare,
  toggleTapTVFavorite,
  toggleTapTVLike,
} from '../services/api'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'
import { getToken } from '../utils/auth'

export function TapTVDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const d = t.taptv.detail
  const showToast = useToastStore((s) => s.showToast)
  const [item, setItem] = useState<TapTVItem | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notFound' | 'error'>('loading')
  const [following, setFollowing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const reload = useCallback(async () => {
    if (!id) return
    setLoadState('loading')
    try {
      const row = await getTapTVItem(id)
      setItem(row ?? null)
      setFollowing(!!row?.followingAuthor)
      setLoadState(row ? 'ready' : 'notFound')
    } catch {
      setItem(null)
      setLoadState('error')
    }
  }, [id])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !item?.videoUrl) return
    video.muted = true
    void video.play().catch(() => {
      /* 浏览器策略阻止时，用户可手动点击播放 */
    })
  }, [item?.videoUrl])

  const requireLogin = () => {
    if (getToken()) return true
    showToast({ type: 'info', message: t.login.title })
    navigate('/login')
    return false
  }

  const handleLike = async () => {
    if (!item || !requireLogin()) return
    try {
      const res = await toggleTapTVLike(item.id)
      setItem((prev) => prev ? { ...prev, likes: res.likes, likedByMe: res.liked } : prev)
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : t.workspace.projectMenu.comingSoon })
    }
  }

  const handleFavorite = async () => {
    if (!item || !requireLogin()) return
    try {
      const res = await toggleTapTVFavorite(item.id)
      setItem((prev) => prev ? { ...prev, favorites: res.favorites, favoritedByMe: res.favorited } : prev)
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : t.workspace.projectMenu.comingSoon })
    }
  }

  const handleShare = async () => {
    if (!item) return
    const url = `${window.location.origin}/taptv/${item.id}`
    try {
      await navigator.clipboard.writeText(url)
      const res = await recordTapTVShare(item.id)
      setItem((prev) => prev ? { ...prev, shares: res.shares } : prev)
      showToast({ type: 'success', message: t.workspace.projectMenu.shareCopied })
    } catch {
      showToast({ type: 'info', message: url })
    }
  }

  const handleFollow = async () => {
    if (!item?.authorUserId || !requireLogin()) return
    try {
      const res = await followTapTVUser(item.authorUserId)
      setFollowing(res.following)
    } catch (err: unknown) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : t.workspace.projectMenu.comingSoon })
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/taptv')
    }
  }

  if (loadState !== 'ready' || !item) {
    return (
      <div className="taptv-detail-state">
        {loadState === 'loading' ? (
          <div className="taptv-detail-state-skeleton" role="status" aria-label={d.loading}>
            <span />
            <span />
            <span className="is-short" />
          </div>
        ) : (
          <div className="taptv-detail-state-message" role="alert">
            <strong>{loadState === 'notFound' ? d.notFound : d.loadFailed}</strong>
            <div>
              {loadState === 'error' && (
                <button type="button" className="ui-clickable" onClick={() => void reload()}>{d.retry}</button>
              )}
              <button type="button" className="ui-clickable" onClick={handleBack}>{d.back}</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="taptv-detail-page flex-1 overflow-y-auto">
      <div className="taptv-detail-layout">
        <div className="taptv-detail-player group">
          <button
            type="button"
            className="taptv-detail-back-btn ui-clickable"
            onClick={handleBack}
            aria-label={d.back}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {d.back}
          </button>
          <video
            ref={videoRef}
            className="taptv-detail-video"
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            referrerPolicy="no-referrer"
            src={item.videoUrl}
          >
            <track kind="captions" />
          </video>
        </div>

        <div className="taptv-detail-info home-section-pad">
          <h1 className="taptv-detail-title font-semibold leading-snug text-white">{item.title}</h1>

          <div className="taptv-detail-meta mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="taptv-detail-avatar">{item.authorAvatar}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{item.author}</p>
              </div>
              {item.authorUserId != null && (
                <button
                  type="button"
                  className={`taptv-follow-btn ui-clickable shrink-0 ${following ? 'taptv-follow-btn--active' : ''}`}
                  onClick={() => void handleFollow()}
                >
                  {following ? d.follow : `+ ${d.follow}`}
                </button>
              )}
            </div>

            <div className="taptv-detail-actions flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`taptv-stat-btn ui-clickable ${item.likedByMe ? 'taptv-stat-btn--active' : ''}`}
                onClick={() => void handleLike()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={item.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.likes}
              </button>
              <button
                type="button"
                className={`taptv-stat-btn ui-clickable ${item.favoritedByMe ? 'taptv-stat-btn--active' : ''}`}
                onClick={() => void handleFavorite()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={item.favoritedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
                </svg>
                {item.favorites}
              </button>
              <button type="button" className="taptv-stat-btn ui-clickable" onClick={() => void handleShare()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.shares}
              </button>
              <button
                type="button"
                className="taptv-workflow-btn ui-clickable"
                onClick={() => navigate(`/taptv/${item.id}/workflow`)}
              >
                {d.viewWorkflow}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {item.description && (
            <div className="taptv-detail-desc mt-5 whitespace-pre-line text-sm leading-relaxed text-white/45">
              {item.description}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
