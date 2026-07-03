/** 图片生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { useI18n } from '../../store/langStore'
import { BaseNode } from './BaseNode'
import { NodeTypeIcon } from './NodeTypeIcon'

export function ImageNode(props: NodeProps) {
  const data = props.data as NodeData
  const { t } = useI18n()
  const waiting = t.canvas.nodeEditor.waitingImage

  return (
    <BaseNode {...props} type="image" hasInput hasOutput>
      {data.outputUrl ? (
        <img src={data.outputUrl} alt="" className="canvas-node-media" />
      ) : (
        <div className="canvas-node-placeholder">
          <NodeTypeIcon type="image" />
          <span className="mt-2 text-[11px] text-white/30">{waiting}</span>
        </div>
      )}
    </BaseNode>
  )
}
