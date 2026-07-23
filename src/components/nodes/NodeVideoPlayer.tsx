/** 视频节点自定义播放器：铺满画面 + 轻量控件浮层；星标写入「我的收藏」 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMediaFavoriteStatus, toggleMediaFavorite } from '../../services/api'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { getToken } from '../../utils/auth'

function formatSeconds(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0.0s'
  return `${value.toFixed(1)}s`
}

type NodeVideoPlayerProps = {
  src: string
  nodeId?: string
  title?: string
}

export function NodeVideoPlayer({ src, nodeId, title }: NodeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useI18n()
  const showToast = useToastStore((s) => s.showToast)
  const cloudId = useCanvasStore((s) => s.cloudId)
  const projectName = useCanvasStore((s) => s.project.name)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [starred, setStarred] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const dragging = useRef(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onTime = () => {
      if (!dragging.current) setCurrent(el.currentTime)
    }
    const onMeta = () => setDuration(el.duration || 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [src])

  useEffect(() => {
    let cancelled = false
    setStarred(false)
    if (!src || !getToken()) return
    void getMediaFavoriteStatus(src)
      .then((res) => {
        if (!cancelled) setStarred(res.favorited)
      })
      .catch(() => {
        if (!cancelled) setStarred(false)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    if (el.paused) void el.play().catch(() => {})
    else el.pause()
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!getToken()) {
      navigate('/login')
      return
    }
    if (!src || favoriting) return
    setFavoriting(true)
    try {
      const res = await toggleMediaFavorite({
        mediaUrl: src,
        mediaType: 'video',
        title: title?.trim() || projectName || undefined,
        projectId: cloudId ?? undefined,
        nodeId,
      })
      setStarred(res.favorited)
      showToast({
        type: 'success',
        message: res.favorited ? t.canvas.nodeEditor.favorited : t.canvas.nodeEditor.unfavorited,
      })
    } catch (err) {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : t.canvas.nodeEditor.favoriteFailed,
      })
    } finally {
      setFavoriting(false)
    }
  }

  const seekFromClientX = (clientX: number) => {
    const el = videoRef.current
    const track = trackRef.current
    if (!el || !track || !duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
    setCurrent(el.currentTime)
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    seekFromClientX(e.clientX)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    seekFromClientX(e.clientX)
  }

  const onTrackPointerUp = (e: React.PointerEvent) => {
    dragging.current = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const requestFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    if (el.requestFullscreen) void el.requestFullscreen()
    else if ('webkitEnterFullscreen' in el) {
      ;(el as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen()
    }
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const showChrome = hovering || !playing

  return (
    <div
      className={`node-video-player ${showChrome ? 'node-video-player--chrome' : ''}`}
      onMouseEnter={() => {
        setHovering(true)
        const el = videoRef.current
        if (el?.paused) void el.play().catch(() => {})
      }}
      onMouseLeave={() => {
        setHovering(false)
        videoRef.current?.pause()
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="node-video-player-media"
        muted={muted}
        playsInline
        preload="metadata"
        referrerPolicy="no-referrer"
        draggable={false}
      />

      {/* 仅控件层禁用节点拖动；画面区域可正常拖动节点 */}
      <div
        className="node-video-player-top nowheel nopan nodrag"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="node-video-player-btn" onClick={toggleMute} title={muted ? '取消静音' : '静音'}>
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
              <path d="M22 9l-6 6M16 9l6 6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
              <path d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className={`node-video-player-btn ${starred ? 'is-active' : ''}`}
          onClick={(e) => void toggleFavorite(e)}
          disabled={favoriting}
          title="收藏到我的收藏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 17.2 6.8 19.8l1-5.8L3.6 9.9l5.8-.8L12 3.8z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div
        className="node-video-player-bottom nowheel nopan nodrag"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="node-video-player-btn" onClick={togglePlay} title={playing ? '暂停' : '播放'}>
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
          )}
        </button>
        <span className="node-video-player-time">{formatSeconds(current)}</span>
        <div
          ref={trackRef}
          className="node-video-player-track"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
        >
          <div className="node-video-player-track-fill" style={{ width: `${progress}%` }} />
          <span className="node-video-player-thumb" style={{ left: `${progress}%` }} />
        </div>
        <span className="node-video-player-time">{formatSeconds(duration)}</span>
        <button type="button" className="node-video-player-btn" onClick={requestFullscreen} title="全屏">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
