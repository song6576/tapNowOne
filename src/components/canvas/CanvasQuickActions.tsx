/** 空画布中心快捷操作：文生视频、图生视频等 */
import { memo } from 'react'
import { useI18n } from '../../store/langStore'

interface CanvasQuickActionsProps {
  onTextToVideo: () => void
  onImageToVideo: () => void
  onSmartVideo: () => void
  onMixVideo: () => void
  onLyrics: () => void
}

const QUICK_ACTIONS = [
  { key: 'textToVideo' as const, icon: '▶' },
  { key: 'imageToVideo' as const, icon: '🖼' },
  { key: 'smartVideo' as const, icon: '✨' },
  { key: 'mixVideo' as const, icon: '⚡' },
  { key: 'lyrics' as const, icon: '♪' },
] as const

export const CanvasQuickActions = memo(function CanvasQuickActions({
  onTextToVideo,
  onImageToVideo,
  onSmartVideo,
  onMixVideo,
  onLyrics,
}: CanvasQuickActionsProps) {
  const { t } = useI18n()
  const c = t.canvas

  const handlers = {
    textToVideo: onTextToVideo,
    imageToVideo: onImageToVideo,
    smartVideo: onSmartVideo,
    mixVideo: onMixVideo,
    lyrics: onLyrics,
  }

  return (
    <div className="canvas-quick-actions pointer-events-auto">
      <div className="canvas-quick-badge">
        <span className="canvas-quick-badge-icon">✨</span>
        <span className="font-medium text-white/90">{c.aiSubHint}</span>
        <span className="text-white/40">{c.aiHint}</span>
      </div>
      <div className="canvas-quick-row">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={handlers[action.key]}
            className="canvas-quick-btn ui-clickable"
          >
            <span className="canvas-quick-btn-icon">{action.icon}</span>
            <span>{c[action.key]}</span>
          </button>
        ))}
      </div>
    </div>
  )
})
