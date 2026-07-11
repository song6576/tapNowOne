/** 节点通用外壳：图3 风格卡片 + 选中时内联对话框 */
import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react'
import type { NodeData, NodeType } from '../../types'
import { NODE_META } from '../../types'
import { useI18n } from '../../store/langStore'
import { NodeHeaderIcon } from './NodeTypeIcon'
import { NodeInlineEditor } from './NodeInlineEditor'

interface BaseNodeProps extends NodeProps {
  type: NodeType
  hasInput?: boolean
  hasOutput?: boolean
  children?: React.ReactNode
}

export function BaseNode({
  id,
  type,
  hasInput = false,
  hasOutput = true,
  selected,
  data,
  children,
}: BaseNodeProps) {
  const meta = NODE_META[type]
  const nodeData = data as NodeData
  const generating = nodeData.status === 'generating'
  const { t } = useI18n()

  return (
    <div className={`canvas-node canvas-node--${type} ${selected ? 'canvas-node--selected' : ''} ${generating ? 'canvas-node--generating' : ''}`}>
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="canvas-node-handle canvas-node-handle--left"
        />
      )}

      <div className="canvas-node-card">
        <div className="canvas-node-header">
          <NodeHeaderIcon type={type} />
          <span className="canvas-node-label">{nodeData.label || meta.label}</span>
        </div>
        <div className="canvas-node-body">{children}</div>
      </div>

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="canvas-node-handle canvas-node-handle--right"
        />
      )}

      {generating && (
        <div className="canvas-node-loading" aria-live="polite">
          <div className="canvas-node-thinking">
            <span className="canvas-node-thinking-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="canvas-node-thinking-label">{t.canvas.nodeEditor.thinking}</span>
          </div>
        </div>
      )}

      <NodeToolbar position={Position.Bottom} offset={12} isVisible={!!selected}>
        <NodeInlineEditor nodeId={id} type={type} data={nodeData} />
      </NodeToolbar>
    </div>
  )
}
