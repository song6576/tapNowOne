/** 节点下方小型生成对话框（图3） */
import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import type { NodeData, NodeType } from '../../types'

const MODEL_LABELS: Record<string, string> = {
  image: 'Wanx 2.1',
  video: 'Seedance 1.5 Pro',
  audio: 'Edge TTS',
  text: 'Text',
}

interface NodeInlineEditorProps {
  nodeId: string
  type: NodeType
  data: NodeData
}

export function NodeInlineEditor({ nodeId, type, data }: NodeInlineEditorProps) {
  const { t } = useI18n()
  const n = t.canvas.nodeEditor
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const generateNode = useCanvasStore((s) => s.generateNode)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState(data.prompt || '')

  const handleGenerate = async () => {
    if (prompt.trim()) updateNodeData(nodeId, { prompt: prompt.trim() })
    if (type === 'text') return
    setGenerating(true)
    try {
      await generateNode(nodeId)
    } finally {
      setGenerating(false)
    }
  }

  const modelLabel = MODEL_LABELS[type] ?? 'Model'
  const busy = generating || data.status === 'generating'

  return (
    <div className="node-inline-editor" onClick={(e) => e.stopPropagation()}>
      <div className="node-inline-editor-toolbar">
        <button type="button" className="node-inline-editor-icon ui-clickable" title={n.magic}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="node-inline-editor-icon ui-clickable" title={n.add}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="node-inline-editor-icon ui-clickable" title={n.swap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={n.placeholder}
        rows={2}
        className="node-inline-editor-input"
      />

      <div className="node-inline-editor-footer">
        <div className="node-inline-editor-meta">
          <span className="node-inline-editor-model">{modelLabel}</span>
          {type === 'video' && <span className="text-white/30">· 16:9 · 480p · 5s</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="node-inline-editor-credits">◆ 23</span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="node-inline-editor-submit ui-clickable"
            aria-label={n.generate}
          >
            {busy ? '…' : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
