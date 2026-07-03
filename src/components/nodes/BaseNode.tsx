/** 节点通用外壳：图3 风格卡片 + 选中时内联对话框 */
import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react'
import type { NodeData, NodeType } from '../../types'
import { NODE_META } from '../../types'
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

  return (
    <div className={`canvas-node ${selected ? 'canvas-node--selected' : ''}`}>
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
        <div className="canvas-node-loading">
          <span className="canvas-node-loading-dot" />
        </div>
      )}

      <NodeToolbar position={Position.Bottom} offset={12} isVisible={!!selected}>
        <NodeInlineEditor nodeId={id} type={type} data={nodeData} />
      </NodeToolbar>
    </div>
  )
}
