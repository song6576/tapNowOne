/** 文本/脚本节点：固定宽度、选中从四角拖宽、生成结果回填不撑开 */
import { useEffect, useState } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

export const TEXT_NODE_DEFAULT_WIDTH = 280
export const TEXT_NODE_MIN_WIDTH = 200
export const TEXT_NODE_MAX_WIDTH = 640
export const TEXT_NODE_MIN_HEIGHT = 120

export function TextNode(props: NodeProps) {
  const data = props.data as NodeData
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const selectedCount = useCanvasStore((s) => s.nodes.reduce((n, node) => n + (node.selected ? 1 : 0), 0))
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.outputText || data.prompt || '')

  const display = data.outputText || data.prompt
  const placeholder = t.canvas.nodeEditor.textPlaceholder
  const generating = data.status === 'generating'
  const soloSelected = !!props.selected && selectedCount === 1

  useEffect(() => {
    if (!editing) {
      setDraft(data.outputText || data.prompt || '')
    }
  }, [data.outputText, data.prompt, editing])

  const commit = () => {
    updateNodeData(props.id, { prompt: draft, outputText: draft })
    setEditing(false)
  }

  return (
    <>
      <NodeResizer
        isVisible={soloSelected && !generating}
        minWidth={TEXT_NODE_MIN_WIDTH}
        maxWidth={TEXT_NODE_MAX_WIDTH}
        minHeight={TEXT_NODE_MIN_HEIGHT}
        keepAspectRatio
        lineClassName="canvas-node-resize-line"
        handleClassName="canvas-node-resize-handle"
      />

      <BaseNode {...props} type="text" hasInput={false} hasOutput filled={Boolean(display)}>
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false)
            }}
            className="canvas-node-text-input nowheel nopan nodrag"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          />
        ) : display ? (
          <div
            className="canvas-node-text-preview nowheel nopan nodrag"
            onDoubleClick={(e) => {
              if (generating) return
              e.stopPropagation()
              setDraft(display)
              setEditing(true)
            }}
            onWheel={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {display}
          </div>
        ) : (
          <button
            type="button"
            className="canvas-node-placeholder ui-clickable"
            onDoubleClick={(e) => {
              if (generating) return
              e.stopPropagation()
              setDraft('')
              setEditing(true)
            }}
          >
            <NodeTypeIcon type="text" className="h-8 w-8" />
            <span className="mt-2 text-[11px] text-white/30">{placeholder}</span>
          </button>
        )}
      </BaseNode>
    </>
  )
}
