/** 分组容器：圆角透明底、可选中空白、选中后可拉宽高；子节点不可拖出 */
import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { useCanvasStore } from '../../store/canvasStore'

const GROUP_MIN_WIDTH = 200
const GROUP_MIN_HEIGHT = 140

export function GroupNode({ data, selected }: NodeProps) {
  const nodeData = data as NodeData
  const selectedCount = useCanvasStore((s) => s.nodes.reduce((n, node) => n + (node.selected ? 1 : 0), 0))
  const soloSelected = !!selected && selectedCount === 1

  return (
    <>
      <NodeResizer
        isVisible={soloSelected}
        minWidth={GROUP_MIN_WIDTH}
        minHeight={GROUP_MIN_HEIGHT}
        lineClassName="canvas-node-resize-line"
        handleClassName="canvas-node-resize-handle"
      />
      <div className={`canvas-group-node ${selected ? 'canvas-group-node--selected' : ''}`}>
        <div className="canvas-group-node-label" title={nodeData.label || 'Group'}>
          <span className="canvas-group-node-label-icon">▦</span>
          <span className="canvas-group-node-label-text">{nodeData.label || 'Group'}</span>
        </div>
      </div>
    </>
  )
}
