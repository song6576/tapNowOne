import { memo } from 'react'
import { useI18n } from '../../store/langStore'

interface CanvasQuickActionsProps {
  onTextToVideo: () => void
  onImageToVideo: () => void
  onSmartVideo: () => void
  onAudioToVideo: () => void
  onDigitalHuman: () => void
}

const QUICK_ACTIONS = [
  { key: 'textToVideo' as const, icon: '📺' },
  { key: 'imageToVideo' as const, icon: '🖼' },
  { key: 'smartVideo' as const, icon: '✨' },
  { key: 'audioToVideo' as const, icon: '🎵' },
  { key: 'digitalHuman' as const, icon: '👤' },
] as const

export const CanvasQuickActions = memo(function CanvasQuickActions({
  onTextToVideo,
  onImageToVideo,
  onSmartVideo,
  onAudioToVideo,
  onDigitalHuman,
}: CanvasQuickActionsProps) {
  const { t } = useI18n()
  const c = t.canvas

  const handlers = {
    textToVideo: onTextToVideo,
    imageToVideo: onImageToVideo,
    smartVideo: onSmartVideo,
    audioToVideo: onAudioToVideo,
    digitalHuman: onDigitalHuman,
  }

  return (
    <div className="canvas-quick-actions pointer-events-auto">
      <div className="canvas-quick-badge">
        <span className="text-white/90">✨ {c.aiSubHint}</span>
        <span className="text-white/45">{c.aiHint}</span>
      </div>
      <div className="canvas-quick-row">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={handlers[action.key]}
            className="canvas-quick-btn ui-clickable"
          >
            <span className="text-base">{action.icon}</span>
            <span>{c[action.key]}</span>
          </button>
        ))}
      </div>
    </div>
  )
})
