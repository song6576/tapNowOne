/** 空画布底部：缩放控制（同步 React Flow + 小地图）、小地图开关等 */
import { useReactFlow, useViewport } from '@xyflow/react'
import { Tooltip } from '../ui/Tooltip'
import { useI18n } from '../../store/langStore'

interface CanvasBottomBarProps {
  showMinimap: boolean
  onToggleMinimap: () => void
  /** 缩放变化时回写到项目 viewport（可选） */
  onViewportPersist?: (viewport: { x: number; y: number; zoom: number }) => void
}

export function CanvasBottomBar({
  showMinimap,
  onToggleMinimap,
  onViewportPersist,
}: CanvasBottomBarProps) {
  const { t } = useI18n()
  const tips = t.canvas.tooltips
  const { setViewport, fitView, getViewport } = useReactFlow()
  const { x, y, zoom } = useViewport()

  const applyZoom = (nextZoom: number) => {
    const clamped = Math.min(2, Math.max(0.1, nextZoom))
    const next = { x, y, zoom: clamped }
    void setViewport(next)
    onViewportPersist?.(next)
  }

  const handleFitView = () => {
    void fitView({ padding: 0.18, duration: 280 })
    window.setTimeout(() => {
      onViewportPersist?.(getViewport())
    }, 300)
  }

  return (
    <div className="canvas-bottom-bar pointer-events-auto">
      <Tooltip label={showMinimap ? tips.minimapHide : tips.minimapShow}>
        <button
          type="button"
          onClick={onToggleMinimap}
          className={`canvas-bottom-icon ui-clickable ${showMinimap ? 'canvas-bottom-icon--active' : ''}`}
          aria-pressed={showMinimap}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 6l6-3 6 3 6-3v12l-6 3-6-3-6 3V6z" strokeLinejoin="round" />
            <path d="M8 5v12M16 8v9" strokeLinecap="round" />
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
        <button type="button" onClick={handleFitView} className="canvas-bottom-icon ui-clickable">
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
            onChange={(e) => applyZoom(Number(e.target.value) / 100)}
            className="canvas-zoom-input"
            aria-label={tips.zoom}
          />
        </div>
      </Tooltip>

      <Tooltip label={tips.help}>
        <button type="button" className="canvas-bottom-help ui-clickable">
          ?
        </button>
      </Tooltip>
    </div>
  )
}
