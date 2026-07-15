/** 首页 AI 进入画布时的右侧 Agent 面板（可拖拽调宽） */
import { useCallback, useEffect, useState } from 'react'
import { AgentChat } from '../AgentChat'
import { DEFAULT_AGENT_MODEL } from '../../types/aiModel'
import { useI18n } from '../../store/langStore'
import { usePanelResize } from '../../hooks/usePanelResize'
import { getConversation, listProjectConversations } from '../../services/api'
import type { AgentConversationMeta } from '../../api/client'
import { useRelativeTime } from '../../hooks/useRelativeTime'

interface CanvasAgentPanelProps {
  projectId?: string
  initialPrompt?: string
  modelId?: string
  autoModel?: boolean
  onModelChange?: (modelId: string) => void
  onAutoModelChange?: (auto: boolean) => void
  onClose?: () => void
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function HistoryItem({
  item,
  active,
  onSelect,
}: {
  item: AgentConversationMeta
  active: boolean
  onSelect: () => void
}) {
  const relative = useRelativeTime(item.updated_at)
  return (
    <button
      type="button"
      className={`canvas-agent-history-item ui-clickable ${active ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="truncate">{item.title?.trim() || 'Untitled'}</span>
      <span className="shrink-0 text-[11px] text-white/35">{relative}</span>
    </button>
  )
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

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState<AgentConversationMeta[]>([])
  const [chatKey, setChatKey] = useState(0)
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [seedMessages, setSeedMessages] = useState<ChatMessage[] | undefined>()
  const [seedPrompt, setSeedPrompt] = useState(initialPrompt)

  const refreshHistory = useCallback(async () => {
    if (!projectId) {
      setHistoryItems([])
      return
    }
    setHistoryLoading(true)
    try {
      const list = await listProjectConversations(projectId)
      setHistoryItems(list)
    } catch {
      setHistoryItems([])
    } finally {
      setHistoryLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!historyOpen) return
    void refreshHistory()
  }, [historyOpen, refreshHistory])

  const startNewChat = () => {
    setActiveConversationId(undefined)
    setSeedMessages(undefined)
    setSeedPrompt(undefined)
    setChatKey((k) => k + 1)
    setHistoryOpen(false)
  }

  const openConversation = async (id: string) => {
    setHistoryOpen(false)
    try {
      const detail = await getConversation(id)
      const msgs: ChatMessage[] = detail.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      setActiveConversationId(detail.id)
      setSeedMessages(msgs.length ? msgs : [{ role: 'assistant', content: a.welcome }])
      setSeedPrompt(undefined)
      setChatKey((k) => k + 1)
    } catch {
      /* ignore */
    }
  }

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
        <div className="relative flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="canvas-agent-panel-icon ui-clickable"
            aria-label={a.history}
            title={a.history}
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="canvas-agent-panel-icon ui-clickable"
              aria-label={a.minimize}
              title={a.minimize}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {historyOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setHistoryOpen(false)} />
              <div className="canvas-agent-history-menu ui-glass-panel absolute right-0 top-full z-40 mt-2 w-[260px] py-2">
                <button
                  type="button"
                  className="ui-clickable flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/85 hover:bg-white/5"
                  onClick={startNewChat}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  {a.historyNew}
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <div className="max-h-[280px] overflow-y-auto px-1">
                  {historyLoading ? (
                    <p className="px-3 py-3 text-xs text-white/35">{a.historyLoading}</p>
                  ) : historyItems.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-white/35">{a.historyEmpty}</p>
                  ) : (
                    historyItems.map((item) => (
                      <HistoryItem
                        key={item.id}
                        item={item}
                        active={item.id === activeConversationId}
                        onSelect={() => void openConversation(item.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AgentChat
          key={chatKey}
          variant="canvas"
          projectId={projectId}
          initialPrompt={seedPrompt}
          initialConversationId={activeConversationId}
          initialMessages={seedMessages}
          modelId={modelId}
          autoModel={autoModel}
          onModelChange={onModelChange}
          onAutoModelChange={onAutoModelChange}
        />
      </div>
    </aside>
  )
}
