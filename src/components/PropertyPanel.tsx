import { useState } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { NODE_META, type NodeType } from '../types'

const MODEL_OPTIONS: Record<string, string[]> = {
  image: ['wanx2.1-t2i-turbo', 'Midjourney', 'Flux'],
  video: ['wan2.1-i2v-turbo', 'Kling', 'Runway'],
  audio: ['edge-tts', 'ElevenLabs'],
}

const inputCls =
  'w-full rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] px-3 py-2 text-xs text-[var(--tn-text-secondary)] outline-none focus:border-zinc-500'

interface PropertyPanelProps {
  embedded?: boolean
}

export function PropertyPanel({ embedded }: PropertyPanelProps) {
  const selectedNode = useCanvasStore((s) => s.getSelectedNode())
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const generateNode = useCanvasStore((s) => s.generateNode)
  const edges = useCanvasStore((s) => s.edges)
  const [generating, setGenerating] = useState(false)

  const wrapperClass = embedded ? 'flex h-full flex-col' : 'flex w-80 shrink-0 flex-col'

  if (!selectedNode) {
    return (
      <aside className={wrapperClass + ' p-4'}>
        <p className="text-xs text-[var(--tn-text-muted)]">Select a node to inspect</p>
        <div className="mt-6 space-y-2 text-[10px] text-zinc-600">
          <p>Left toolbar — add nodes</p>
          <p>Right-click canvas — context menu</p>
          <p>Drag handles — connect nodes</p>
          <p>Agent tab — chat & workflow</p>
        </div>
      </aside>
    )
  }

  const type = selectedNode.type as NodeType
  const meta = NODE_META[type]
  const data = selectedNode.data
  const models = MODEL_OPTIONS[type]
  const canGenerate = type !== 'text'
  const isGenerating = data.status === 'generating' || generating
  const upstreamCount = edges.filter((e) => e.target === selectedNode.id).length

  const handleGenerate = async () => {
    setGenerating(true)
    try { await generateNode(selectedNode.id) } finally { setGenerating(false) }
  }

  return (
    <aside className={wrapperClass}>
      <div className="border-b border-[var(--tn-border-subtle)] p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{meta.icon}</span>
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--tn-text-secondary)]">
            {meta.label}
          </h2>
        </div>
        <p className="mt-1 text-[10px] text-[var(--tn-text-muted)]">{meta.description}</p>
        {upstreamCount > 0 && (
          <p className="mt-1 text-[10px] text-zinc-400">{upstreamCount} upstream connected</p>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">Label</label>
          <input type="text" value={data.label} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} className={inputCls} />
        </div>

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
            {type === 'text' ? 'Content' : 'Prompt'}
          </label>
          <textarea
            value={data.prompt}
            onChange={(e) => {
              const patch: Record<string, string> = { prompt: e.target.value }
              if (type === 'text') patch.outputText = e.target.value
              updateNodeData(selectedNode.id, patch)
            }}
            rows={5}
            className={inputCls + ' resize-none'}
          />
        </div>

        {models && (
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">Model</label>
            <select value={data.model ?? models[0]} onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })} className={inputCls}>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {type === 'video' && (
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">Duration (s)</label>
            <input type="number" min={1} max={15} value={data.duration ?? 4} onChange={(e) => updateNodeData(selectedNode.id, { duration: Number(e.target.value) })} className={inputCls} />
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-[var(--tn-text-muted)]">
          <span className={`h-1.5 w-1.5 rounded-full ${data.status === 'done' ? 'bg-emerald-400' : data.status === 'generating' ? 'bg-amber-400 animate-pulse' : data.status === 'error' ? 'bg-red-400' : 'bg-zinc-600'}`} />
          {data.status}
          {data.errorMessage && <span className="text-red-400">{data.errorMessage}</span>}
        </div>

        {canGenerate && (
          <button type="button" disabled={isGenerating} onClick={handleGenerate} className="tn-btn tn-btn-primary w-full text-xs disabled:opacity-50">
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        )}
      </div>

      <div className="border-t border-[var(--tn-border-subtle)] p-4">
        <button type="button" onClick={deleteSelected} className="w-full rounded-lg border border-red-900/30 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-950/20">
          Delete Node
        </button>
      </div>
    </aside>
  )
}
