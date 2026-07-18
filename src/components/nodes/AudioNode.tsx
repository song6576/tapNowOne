/** 音频生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

export function AudioNode(props: NodeProps) {
  const data = props.data as NodeData
  const filled = Boolean(data.outputUrl)

  return (
    <BaseNode {...props} type="audio" hasInput hasOutput={false} filled={filled}>
      {data.outputUrl ? (
        <div className="canvas-node-audio-wrap">
          <audio src={data.outputUrl} controls className="canvas-node-audio" />
        </div>
      ) : (
        <div className="canvas-node-placeholder canvas-node-placeholder--audio">
          <NodeTypeIcon type="audio" />
        </div>
      )}
    </BaseNode>
  )
}
