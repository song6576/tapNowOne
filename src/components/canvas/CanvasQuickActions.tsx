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
  { key: 'textToVideo' as const, icon: 'textVideo' as const },
  { key: 'imageToVideo' as const, icon: 'imageVideo' as const },
  { key: 'smartVideo' as const, icon: 'smart' as const },
  { key: 'mixVideo' as const, icon: 'mix' as const },
  { key: 'lyrics' as const, icon: 'lyrics' as const },
] as const

function QuickActionIcon({ type }: { type: typeof QUICK_ACTIONS[number]['icon'] | 'agent' }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }
  if (type === 'textVideo') {
    return <svg {...common}><path d="M4 6h9M4 11h7M4 16h5M15 12l5 3-5 3v-6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }
  if (type === 'imageVideo') {
    return <svg {...common}><rect x="3" y="5" width="12" height="14" rx="2" /><path d="M5 16l3-3 2 2 3-4 2 3M17 10l4 2.5-4 2.5v-5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }
  if (type === 'smart' || type === 'agent') {
    return <svg {...common}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" strokeLinejoin="round" /></svg>
  }
  if (type === 'mix') {
    return <svg {...common}><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" strokeLinecap="round" /></svg>
  }
  return <svg {...common}><path d="M9 18V5l11-2v13M9 9l11-2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
}

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
        <span className="canvas-quick-badge-icon" aria-hidden><QuickActionIcon type="agent" /></span>
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
            <span className="canvas-quick-btn-icon" aria-hidden><QuickActionIcon type={action.icon} /></span>
            <span>{c[action.key]}</span>
          </button>
        ))}
      </div>
    </div>
  )
})
