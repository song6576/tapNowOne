/** Agent 对话面板：普通聊天、分镜指令、Run Workflow、Chat 建节点 */
import { useCanvasStore } from '../store/canvasStore'
import { agentChat, agentStoryboard } from '../services/api'
import { DEFAULT_AGENT_MODEL } from '../types/aiModel'
import { buildCanvasContext } from '../utils/workflow'
import {
  defaultModelForNode,
  parseLocalCreateIntent,
  summarizeActions,
  type CanvasAction,
} from '../utils/canvasActions'
import { ModelDropdown } from './ui/ModelDropdown'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useI18n } from '../store/langStore'

type Message = { role: 'user' | 'assistant'; content: string }

export function AgentChat({
  variant = 'default',
  projectId,
  initialPrompt,
  initialConversationId,
  initialMessages,
  modelId = DEFAULT_AGENT_MODEL,
  autoModel = true,
  onModelChange,
  onAutoModelChange,
}: {
  variant?: 'default' | 'canvas'
  projectId?: string
  initialPrompt?: string
  /** 从历史记录恢复的会话 ID */
  initialConversationId?: string
  /** 从历史记录恢复的消息列表 */
  initialMessages?: Message[]
  modelId?: string
  autoModel?: boolean
  onModelChange?: (modelId: string) => void
  onAutoModelChange?: (auto: boolean) => void
}) {
  const { t } = useI18n()
  const a = t.canvas.agentPanel
  const isCanvas = variant === 'canvas'
  const welcomeContent = isCanvas
    ? a.welcome
    : 'Hi, I\'m TapNow Agent.\n\n• Chat to add — describe what you want\n• 「生成分镜：脚本」— auto-create storyboard nodes\n• Run Workflow — batch generate all nodes'

  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessages?.length) return initialMessages
    const prompt = initialPrompt?.trim()
    if (isCanvas && prompt) {
      return [{ role: 'user', content: prompt }]
    }
    return [{ role: 'assistant', content: welcomeContent }]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId)
  const [selectedModelId, setSelectedModelId] = useState(modelId)
  const [selectedAuto, setSelectedAuto] = useState(autoModel)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const seededRef = useRef(false)
  const sendingRef = useRef(false)

  useEffect(() => {
    setSelectedModelId(modelId)
  }, [modelId])

  useEffect(() => {
    setSelectedAuto(autoModel)
  }, [autoModel])

  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const addNode = useCanvasStore((s) => s.addNode)
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)
  const runWorkflow = useCanvasStore((s) => s.runWorkflow)
  const workflowRunning = useCanvasStore((s) => s.workflowRunning)

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const applyActions = useCallback(
    (actions: CanvasAction[]) => {
      let created = 0
      for (const action of actions) {
        if (action.type !== 'add_node') continue
        const count = Math.min(6, Math.max(1, action.count ?? 1))
        for (let i = 0; i < count; i++) {
          const model = defaultModelForNode(action.node_type)
          addNode(action.node_type, undefined, {
            ...(action.label
              ? { label: count > 1 ? `${action.label} ${i + 1}` : action.label }
              : {}),
            ...(action.prompt ? { prompt: action.prompt } : {}),
            ...(model ? { model, autoModel: true } : {}),
          })
          created += 1
        }
      }
      return created
    },
    [addNode],
  )

  const sendText = useCallback(async (text: string, options?: { appendUser?: boolean }) => {
    const trimmed = text.trim()
    if (!trimmed || sendingRef.current) return
    sendingRef.current = true
    const appendUser = options?.appendUser ?? true
    if (appendUser) {
      setMessages((m) => [...m, { role: 'user', content: trimmed }])
    }
    setLoading(true)

    try {
      if (trimmed.startsWith('生成分镜：') || trimmed.startsWith('生成分镜:')) {
        const script = trimmed.replace(/^生成分镜[：:]/, '').trim()
        const scenes = await agentStoryboard(script, selectedModelId, selectedAuto)
        const count = applyStoryboard(scenes, script)
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `已创建 ${count} 个分镜节点，可在画布中继续编辑或生成。` },
        ])
      } else {
        const localActions = parseLocalCreateIntent(trimmed)
        if (localActions.length) {
          applyActions(localActions)
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: summarizeActions(localActions) },
          ])
        }

        const context = buildCanvasContext(nodes, edges)
        const { reply, conversationId: nextConversationId, actions } = await agentChat(
          trimmed,
          context,
          conversationId,
          projectId,
          selectedModelId,
          selectedAuto,
        )
        if (nextConversationId) setConversationId(nextConversationId)

        if (!localActions.length && actions?.length) {
          applyActions(actions)
          const summary = summarizeActions(actions)
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: summary ? `${reply}\n\n${summary}` : reply },
          ])
        } else if (!localActions.length) {
          setMessages((m) => [...m, { role: 'assistant', content: reply }])
        } else if (reply && !reply.includes('已在画布上创建')) {
          setMessages((m) => [...m, { role: 'assistant', content: reply }])
        }
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'unknown'}` },
      ])
    } finally {
      setLoading(false)
      sendingRef.current = false
    }
  }, [nodes, edges, applyActions, applyStoryboard, conversationId, projectId, selectedModelId, selectedAuto])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    void sendText(text)
  }

  useEffect(() => {
    const prompt = initialPrompt?.trim()
    if (!isCanvas || !prompt) return

    setMessages((prev) => {
      const hasUser = prev.some((m) => m.role === 'user' && m.content === prompt)
      if (hasUser) return prev
      return [{ role: 'user', content: prompt }]
    })

    if (seededRef.current) return
    seededRef.current = true
    void sendText(prompt, { appendUser: false })
  }, [isCanvas, initialPrompt, sendText])

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
    <div className={`flex h-full min-h-0 flex-col ${isCanvas ? 'canvas-agent-chat' : ''}`}>
      {!isCanvas && (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--tn-border-subtle)] px-3 py-2">
          <ModelDropdown
            value={selectedModelId}
            onChange={(id) => {
              setSelectedModelId(id)
              onModelChange?.(id)
            }}
            auto={selectedAuto}
            onAutoChange={(next) => {
              setSelectedAuto(next)
              onAutoModelChange?.(next)
            }}
          />
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

      <div
        ref={messagesRef}
        className={`canvas-agent-messages min-h-0 flex-1 space-y-4 overflow-y-auto ${isCanvas ? 'px-5 py-4' : 'space-y-3 p-3'}`}
      >
        {messages.map((msg, i) => {
          const content = msg.content.split('\n').map((line, j) => (
            <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
          ))

          if (isCanvas && msg.role === 'user') {
            return (
              <div key={i} className="canvas-agent-msg-row">
                <div className="canvas-agent-msg canvas-agent-msg--user">{content}</div>
              </div>
            )
          }

          return (
            <div
              key={i}
              className={
                isCanvas
                  ? 'canvas-agent-msg canvas-agent-msg--assistant'
                  : `rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'ml-6 bg-[var(--tn-bg-hover)] text-[var(--tn-text-secondary)]'
                        : 'mr-6 bg-[var(--tn-bg-panel)] text-[var(--tn-text-muted)]'
                    }`
              }
            >
              {content}
            </div>
          )
        })}
        {loading && (
          <div className={`text-sm text-white/35 ${isCanvas ? 'canvas-agent-msg--assistant' : 'mr-6 rounded-lg bg-[var(--tn-bg-panel)] px-3 py-2 text-xs'}`}>
            {a.thinking}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`shrink-0 border-t border-white/[0.06] ${isCanvas ? 'p-4' : 'p-3'}`}>
        {isCanvas ? (
          <>
            <div className="canvas-agent-suggestions">
              {a.suggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setInput(label)}
                  className="canvas-agent-suggestion ui-clickable"
                >
                  {label}
                </button>
              ))}
            </div>
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
                <ModelDropdown
                  compact
                  value={selectedModelId}
                  onChange={(id) => {
                    setSelectedModelId(id)
                    onModelChange?.(id)
                  }}
                  auto={selectedAuto}
                  onAutoChange={(next) => {
                    setSelectedAuto(next)
                    onAutoModelChange?.(next)
                  }}
                />
                <div className="canvas-agent-input-actions-right">
                  <button type="button" className="canvas-agent-tool-btn ui-clickable" aria-label={a.autoGenerate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </button>
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
            </div>
          </>
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
