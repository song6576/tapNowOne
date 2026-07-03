/** 视频生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

function isImagePreview(url: string) {
  return /\.(svg|png|jpe?g|webp)(\?|$)/i.test(url) || url.startsWith('data:image/')
}

export function VideoNode(props: NodeProps) {
  const data = props.data as NodeData

  return (
    <BaseNode {...props} type="video" hasInput hasOutput>
      {data.outputUrl ? (
        isImagePreview(data.outputUrl) ? (
          <img src={data.outputUrl} alt="" className="canvas-node-media" />
        ) : (
          <video src={data.outputUrl} className="canvas-node-media" controls muted />
        )
      ) : (
        <div className="canvas-node-placeholder">
          <NodeTypeIcon type="video" />
        </div>
      )}
    </BaseNode>
  )
}
