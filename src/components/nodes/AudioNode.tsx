/** 音频生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

export function AudioNode(props: NodeProps) {
  const data = props.data as NodeData

  return (
    <BaseNode {...props} type="audio" hasInput hasOutput={false}>
      {data.outputUrl ? (
        <audio src={data.outputUrl} controls className="canvas-node-audio" />
      ) : (
        <div className="canvas-node-placeholder canvas-node-placeholder--audio">
          <NodeTypeIcon type="audio" />
        </div>
      )}
    </BaseNode>
  )
}
