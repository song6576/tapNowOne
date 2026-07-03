/** Agent 对话面板：普通聊天、分镜指令、Run Workflow */
import { useCanvasStore } from '../store/canvasStore'
import { agentChat, agentStoryboard } from '../services/api'
import { buildCanvasContext } from '../utils/workflow'
import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../store/langStore'

type Message = { role: 'user' | 'assistant'; content: string }

export function AgentChat({ variant = 'default' }: { variant?: 'default' | 'canvas' }) {
  const { t } = useI18n()
  const a = t.canvas.agentPanel
  const isCanvas = variant === 'canvas'
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isCanvas
        ? a.welcome
        : 'Hi, I\'m TapNow Agent.\n\n• Chat to add — describe what you want\n• 「生成分镜：脚本」— auto-create storyboard nodes\n• Run Workflow — batch generate all nodes',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)
  const runWorkflow = useCanvasStore((s) => s.runWorkflow)
  const workflowRunning = useCanvasStore((s) => s.workflowRunning)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)

    try {
      // 特殊指令：生成分镜 → 调用 agentStoryboard 并在画布创建节点
      if (text.startsWith('生成分镜：') || text.startsWith('生成分镜:')) {
        const script = text.replace(/^生成分镜[：:]/, '').trim()
        const scenes = await agentStoryboard(script)
        const count = applyStoryboard(scenes, script)
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `Created ${count} storyboard nodes. Click Generate on each, or Run Workflow.` },
        ])
      } else {
        // 普通对话：附带画布摘要作为 Agent 上下文
        const context = buildCanvasContext(nodes, edges)
        const reply = await agentChat(text, context)
        setMessages((m) => [...m, { role: 'assistant', content: reply }])
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'unknown'}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRunWorkflow = async () => {
    setLoading(true)
    try {
      const { done, failed } = await runWorkflow()
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Workflow done: ${done} succeeded, ${failed} failed.` },
      ])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Workflow error: ${err instanceof Error ? err.message : 'unknown'}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex h-full flex-col ${isCanvas ? 'canvas-agent-chat' : ''}`}>
      {!isCanvas && (
        <div className="flex items-center justify-between border-b border-[var(--tn-border-subtle)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--tn-text-muted)]">TapNow Agent</span>
          <button
            type="button"
            disabled={workflowRunning || loading}
            onClick={handleRunWorkflow}
            className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-black hover:opacity-90 disabled:opacity-40"
          >
            {workflowRunning ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      )}

      <div className={`flex-1 space-y-3 overflow-y-auto ${isCanvas ? 'px-5 py-4' : 'p-3'}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              isCanvas
                ? 'text-white/55'
                : `rounded-lg px-3 py-2 text-xs ${
                    msg.role === 'user'
                      ? 'ml-6 bg-[var(--tn-bg-hover)] text-[var(--tn-text-secondary)]'
                      : 'mr-6 bg-[var(--tn-bg-panel)] text-[var(--tn-text-muted)]'
                  }`
            }`}
          >
            {msg.content.split('\n').map((line, j) => (
              <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
            ))}
          </div>
        ))}
        {loading && (
          <div className={`text-sm text-white/35 ${isCanvas ? '' : 'mr-6 rounded-lg bg-[var(--tn-bg-panel)] px-3 py-2 text-xs'}`}>
            {a.thinking}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t border-white/[0.06] ${isCanvas ? 'p-4' : 'p-3'}`}>
        {isCanvas ? (
          <div className="canvas-agent-input-wrap">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={a.inputPlaceholder}
              rows={3}
              className="canvas-agent-input"
            />
            <div className="canvas-agent-input-actions">
              <button type="button" className="canvas-agent-auto-btn ui-clickable">{a.autoGenerate}</button>
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="canvas-agent-send-btn ui-clickable"
                aria-label={a.send}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Chat to add..."
              className="flex-1 rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] px-3 py-2 text-xs text-[var(--tn-text-secondary)] outline-none focus:border-zinc-500"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
