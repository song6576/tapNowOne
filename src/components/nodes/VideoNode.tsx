/** 视频生成节点：有内容时铺满 + 自定义控件 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'
import { NodeVideoPlayer } from './NodeVideoPlayer'

function isImagePreview(url: string) {
  return /\.(svg|png|jpe?g|webp)(\?|$)/i.test(url) || url.startsWith('data:image/')
}

export function VideoNode(props: NodeProps) {
  const data = props.data as NodeData
  const filled = Boolean(data.outputUrl)

  return (
    <BaseNode {...props} type="video" hasInput hasOutput filled={filled}>
      {data.outputUrl ? (
        isImagePreview(data.outputUrl) ? (
          <img src={data.outputUrl} alt="" className="canvas-node-media" />
        ) : (
          <NodeVideoPlayer
            src={data.outputUrl}
            nodeId={props.id}
            title={data.label}
          />
        )
      ) : (
        <div className="canvas-node-placeholder">
          <NodeTypeIcon type="video" />
        </div>
      )}
    </BaseNode>
  )
}
