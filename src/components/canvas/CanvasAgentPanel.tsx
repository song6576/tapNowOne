/** 首页 AI 进入画布时的右侧 Agent 面板（图4） */
import { AgentChat } from '../AgentChat'
import { useI18n } from '../../store/langStore'

interface CanvasAgentPanelProps {
  onClose?: () => void
}

export function CanvasAgentPanel({ onClose }: CanvasAgentPanelProps) {
  const { t } = useI18n()
  const a = t.canvas.agentPanel

  return (
    <aside className="canvas-agent-panel flex shrink-0 flex-col">
      <header className="canvas-agent-panel-header flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
        <span className="text-sm font-medium text-white/90">{a.title}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="canvas-agent-panel-icon ui-clickable" aria-label={a.settings}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
            </svg>
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="canvas-agent-panel-icon ui-clickable" aria-label={a.close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <AgentChat variant="canvas" />
      </div>
    </aside>
  )
}
