/** 空画布底部：缩放控制 */
interface CanvasBottomBarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function CanvasBottomBar({ zoom, onZoomChange }: CanvasBottomBarProps) {
  return (
    <div className="canvas-bottom-bar pointer-events-auto">
      <button type="button" className="canvas-bottom-icon ui-clickable" title="Layers">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className="canvas-bottom-icon ui-clickable" title="Grid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button type="button" className="canvas-bottom-icon ui-clickable" title="Fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
        </svg>
      </button>
      <div className="canvas-zoom-slider">
        <input
          type="range"
          min={10}
          max={200}
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          className="canvas-zoom-input"
        />
      </div>
      <button type="button" className="canvas-bottom-help ui-clickable" title="Help">
        ?
      </button>
    </div>
  )
}
