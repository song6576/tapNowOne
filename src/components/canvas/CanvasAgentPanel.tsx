/** 首页 AI 进入画布时的右侧 Agent 面板（可拖拽调宽） */
import { AgentChat } from '../AgentChat'
import { DEFAULT_AGENT_MODEL } from '../../types/aiModel'
import { useI18n } from '../../store/langStore'
import { usePanelResize } from '../../hooks/usePanelResize'

interface CanvasAgentPanelProps {
  projectId?: string
  initialPrompt?: string
  modelId?: string
  autoModel?: boolean
  onModelChange?: (modelId: string) => void
  onAutoModelChange?: (auto: boolean) => void
  onClose?: () => void
}

export function CanvasAgentPanel({
  projectId,
  initialPrompt,
  modelId = DEFAULT_AGENT_MODEL,
  autoModel = true,
  onModelChange,
  onAutoModelChange,
  onClose,
}: CanvasAgentPanelProps) {
  const { t } = useI18n()
  const a = t.canvas.agentPanel
  const { width, dragging, onPointerDown } = usePanelResize({ defaultWidth: 440 })

  return (
    <aside
      className={`canvas-agent-panel flex h-full min-h-0 shrink-0 flex-col overflow-hidden ${dragging ? 'canvas-agent-panel--dragging' : ''}`}
      style={{ width }}
    >
      <div
        className="canvas-agent-panel-resize"
        onPointerDown={onPointerDown}
        role="separator"
        aria-orientation="vertical"
        aria-label={a.resize}
      />

      <header className="canvas-agent-panel-header flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4">
        <span className="truncate text-sm font-medium text-white/90">{a.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" className="canvas-agent-panel-pill ui-clickable">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            {a.newFeature}
          </button>
          <button type="button" className="canvas-agent-panel-icon ui-clickable" aria-label={a.minimize}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" strokeLinecap="round" />
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AgentChat
          variant="canvas"
          projectId={projectId}
          initialPrompt={initialPrompt}
          modelId={modelId}
          autoModel={autoModel}
          onModelChange={onModelChange}
          onAutoModelChange={onAutoModelChange}
        />
      </div>
    </aside>
  )
}
