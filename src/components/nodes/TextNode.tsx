/** 文本/脚本节点 */
import { useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

export function TextNode(props: NodeProps) {
  const data = props.data as NodeData
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.outputText || data.prompt || '')

  const display = data.outputText || data.prompt
  const placeholder = t.canvas.nodeEditor.textPlaceholder

  const commit = () => {
    updateNodeData(props.id, { prompt: draft, outputText: draft })
    setEditing(false)
  }

  return (
    <BaseNode {...props} type="text" hasInput={false} hasOutput>
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditing(false)
          }}
          className="canvas-node-text-input"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          type="button"
          className="canvas-node-placeholder ui-clickable"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setDraft(display || '')
            setEditing(true)
          }}
        >
          {display ? (
            <span className="canvas-node-text-preview">{display.slice(0, 120)}</span>
          ) : (
            <>
              <NodeTypeIcon type="text" className="h-8 w-8" />
              <span className="mt-2 text-[11px] text-white/30">{placeholder}</span>
            </>
          )}
        </button>
      )}
    </BaseNode>
  )
}
