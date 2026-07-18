/** 节点下方小型生成对话框：引用芯片与加号同排，悬停预览文本/放大图 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_AGENT_MODEL } from '../../types/aiModel'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import {
  getUpstreamInputs,
  type UpstreamImageRef,
  type UpstreamTextRef,
} from '../../utils/upstream'
import { ModelDropdown } from '../ui/ModelDropdown'
import { formatVideoParamsSummary } from '../../constants/videoParams'
import type { NodeData, NodeType } from '../../types'

interface NodeInlineEditorProps {
  nodeId: string
  type: NodeType
  data: NodeData
}

type HoveredRef =
  | { kind: 'text'; item: UpstreamTextRef }
  | { kind: 'image'; item: UpstreamImageRef; index: number }

type PreviewAnchor = { left: number; top: number; width: number }

function TextRefIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h16M4 12h10M4 17h14" strokeLinecap="round" />
    </svg>
  )
}

function RefHoverPreview({
  hovered,
  anchor,
  onEnter,
  onLeave,
}: {
  hovered: HoveredRef
  anchor: PreviewAnchor
  onEnter: () => void
  onLeave: () => void
}) {
  const style = {
    position: 'fixed' as const,
    left: Math.min(Math.max(8, anchor.left), window.innerWidth - 260),
    top: Math.max(8, anchor.top - 10),
    transform: 'translateY(-100%)',
    zIndex: 10050,
  }

  return createPortal(
    <div
      className={`node-inline-ref-preview node-inline-ref-preview--${hovered.kind}`}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {hovered.kind === 'text' ? (
        <>
          <p className="node-inline-ref-preview-text">{hovered.item.text}</p>
          <span className="node-inline-ref-preview-tag">@{hovered.item.label || 'Text'}</span>
        </>
      ) : (
        <>
          <img src={hovered.item.url} alt="" className="node-inline-ref-preview-img" />
          <span className="node-inline-ref-preview-tag">
            @{hovered.item.label || 'Image'} · Image {hovered.index + 1}
          </span>
        </>
      )}
    </div>,
    document.body,
  )
}

export function NodeInlineEditor({ nodeId, type, data }: NodeInlineEditorProps) {
  const { t } = useI18n()
  const n = t.canvas.nodeEditor
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const generateNode = useCanvasStore((s) => s.generateNode)
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState(data.prompt || '')
  const [hiddenRefIds, setHiddenRefIds] = useState<Set<string>>(() => new Set())
  const [hoveredRef, setHoveredRef] = useState<HoveredRef | null>(null)
  const [anchor, setAnchor] = useState<PreviewAnchor | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoveredIdRef = useRef<string | null>(null)

  const upstream = useMemo(
    () => getUpstreamInputs(nodeId, nodes, edges),
    [nodeId, nodes, edges],
  )

  const visibleTexts = useMemo(
    () => upstream.upstreamTexts.filter((item) => !hiddenRefIds.has(item.nodeId)),
    [upstream.upstreamTexts, hiddenRefIds],
  )
  const visibleImages = useMemo(
    () => upstream.upstreamImages.filter((item) => !hiddenRefIds.has(item.nodeId)),
    [upstream.upstreamImages, hiddenRefIds],
  )

  const showRefs = type !== 'text' && (visibleTexts.length > 0 || visibleImages.length > 0)
  const hasAnyUpstreamText = upstream.upstreamTexts.length > 0

  const modelId = data.model ?? DEFAULT_AGENT_MODEL
  const autoModel = data.autoModel !== false
  const canGenerate = type === 'text' || type === 'image' || type === 'video' || type === 'audio'
  const showModelPicker = type !== 'group'
  const canSubmit =
    canGenerate &&
    (prompt.trim().length > 0 || (type !== 'text' && hasAnyUpstreamText))

  useEffect(() => {
    setPrompt(data.prompt || '')
  }, [data.prompt])

  useEffect(() => {
    setHiddenRefIds(new Set())
    setHoveredRef(null)
    setAnchor(null)
  }, [nodeId, upstream.upstreamTexts.length, upstream.upstreamImages.length])

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const showHover = (el: HTMLElement, next: HoveredRef) => {
    cancelHide()
    hoveredIdRef.current = next.item.nodeId
    const rect = el.getBoundingClientRect()
    setAnchor({ left: rect.left, top: rect.top, width: rect.width })
    setHoveredRef(next)
  }

  const scheduleHide = (id: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (hoveredIdRef.current !== id) return
      hoveredIdRef.current = null
      setHoveredRef(null)
      setAnchor(null)
    }, 220)
  }

  const hideRef = (id: string) => {
    setHiddenRefIds((prev) => new Set(prev).add(id))
    if (hoveredIdRef.current === id) {
      hoveredIdRef.current = null
      setHoveredRef(null)
      setAnchor(null)
    }
  }

  const handleGenerate = async () => {
    if (!canSubmit || !canGenerate) return
    const trimmed = prompt.trim()
    updateNodeData(nodeId, { prompt: trimmed })
    setGenerating(true)
    try {
      await generateNode(nodeId)
    } finally {
      setGenerating(false)
    }
  }

  const busy = generating || data.status === 'generating'

  return (
    <div className="node-inline-editor-wrap nowheel nopan nodrag" onClick={(e) => e.stopPropagation()}>
      {hoveredRef && anchor && (
        <RefHoverPreview
          hovered={hoveredRef}
          anchor={anchor}
          onEnter={cancelHide}
          onLeave={() => scheduleHide(hoveredRef.item.nodeId)}
        />
      )}

      <div className="node-inline-editor">
        <div className="node-inline-editor-toolbar">
          <button type="button" className="node-inline-editor-icon ui-clickable" title={n.magic}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="node-inline-editor-toolbar-divider" aria-hidden />

          <div className="node-inline-editor-refs" role="list">
            {visibleTexts.map((item) => (
              <div
                key={item.nodeId}
                className="node-inline-ref-chip node-inline-ref-chip--text"
                role="listitem"
                onMouseEnter={(e) => showHover(e.currentTarget, { kind: 'text', item })}
                onMouseLeave={() => scheduleHide(item.nodeId)}
              >
                <span className="node-inline-ref-chip-main" aria-label={`@${item.label}`}>
                  <TextRefIcon />
                </span>
                <button
                  type="button"
                  className="node-inline-ref-chip-x ui-clickable"
                  aria-label="hide"
                  onClick={() => hideRef(item.nodeId)}
                >
                  ×
                </button>
              </div>
            ))}
            {visibleImages.map((item, index) => (
              <div
                key={item.nodeId}
                className="node-inline-ref-chip node-inline-ref-chip--image"
                role="listitem"
                onMouseEnter={(e) => showHover(e.currentTarget, { kind: 'image', item, index })}
                onMouseLeave={() => scheduleHide(item.nodeId)}
              >
                <span
                  className="node-inline-ref-chip-main"
                  aria-label={`${item.label} Image ${index + 1}`}
                >
                  <img src={item.url} alt="" className="node-inline-ref-thumb" />
                </span>
                <button
                  type="button"
                  className="node-inline-ref-chip-x ui-clickable"
                  aria-label="hide"
                  onClick={() => hideRef(item.nodeId)}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="node-inline-editor-icon ui-clickable" title={n.add}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <button type="button" className="node-inline-editor-icon ui-clickable" title={n.swap}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canSubmit && !busy) {
              e.preventDefault()
              void handleGenerate()
            }
          }}
          placeholder={showRefs ? n.appendPlaceholder : n.placeholder}
          rows={2}
          className="node-inline-editor-input"
          disabled={busy}
        />

        <div className="node-inline-editor-footer">
          <div className="node-inline-editor-meta">
            {showModelPicker ? (
              <ModelDropdown
                compact
                value={modelId}
                onChange={(id) => updateNodeData(nodeId, { model: id })}
                auto={autoModel}
                onAutoChange={(next) => updateNodeData(nodeId, { autoModel: next })}
                nodeType={type}
                category={type === 'image' ? 'image' : type === 'video' ? 'video' : type === 'audio' ? 'audio' : 'text'}
                align="right"
              />
            ) : (
              <span className="node-inline-editor-model">Group</span>
            )}
            {type === 'video' && (
              <span className="text-white/30">
                · {formatVideoParamsSummary({
                  ratio: data.videoRatio,
                  resolution: data.videoResolution,
                  duration: data.duration,
                  watermark: data.videoWatermark,
                })}
              </span>
            )}
          </div>
          {canGenerate && (
            <div className="node-inline-editor-actions">
              {busy && (
                <span className="node-inline-editor-thinking">{n.thinking}</span>
              )}
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={busy || !canSubmit}
                className="node-inline-editor-submit ui-clickable"
                aria-label={n.generate}
                title={n.generate}
              >
                {busy ? (
                  <span className="node-inline-editor-submit-spin" aria-hidden />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
