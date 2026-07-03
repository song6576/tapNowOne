/** 空画布底部：缩放控制、小地图开关等 */
import { Tooltip } from '../ui/Tooltip'
import { useI18n } from '../../store/langStore'

interface CanvasBottomBarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  showMinimap: boolean
  onToggleMinimap: () => void
}

export function CanvasBottomBar({ zoom, onZoomChange, showMinimap, onToggleMinimap }: CanvasBottomBarProps) {
  const { t } = useI18n()
  const tips = t.canvas.tooltips

  return (
    <div className="canvas-bottom-bar pointer-events-auto">
      <Tooltip label={tips.layers}>
        <button type="button" className="canvas-bottom-icon ui-clickable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </Tooltip>

      <Tooltip label={tips.grid}>
        <button type="button" className="canvas-bottom-icon ui-clickable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </Tooltip>

      <Tooltip label={tips.fitView}>
        <button type="button" className="canvas-bottom-icon ui-clickable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
          </svg>
        </button>
      </Tooltip>

      <Tooltip label={tips.zoom}>
        <div className="canvas-zoom-slider">
          <input
            type="range"
            min={10}
            max={200}
            value={Math.round(zoom * 100)}
            onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
            className="canvas-zoom-input"
            aria-label={tips.zoom}
          />
        </div>
      </Tooltip>

      <Tooltip label={showMinimap ? tips.minimapHide : tips.minimapShow}>
        <button
          type="button"
          onClick={onToggleMinimap}
          className={`canvas-bottom-help ui-clickable ${showMinimap ? 'canvas-bottom-icon--active' : ''}`}
          aria-pressed={showMinimap}
        >
          ?
        </button>
      </Tooltip>
    </div>
  )
}
