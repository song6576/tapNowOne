/** 图片生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'

function NodePlaceholder({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--tn-border)] bg-[var(--tn-bg)] px-3 text-center text-[11px] text-[var(--tn-text-muted)]">
      <span className="text-base opacity-60">{icon}</span>
      <span className="line-clamp-2">{text}</span>
    </div>
  )
}

export function ImageNode(props: NodeProps) {
  const data = props.data as NodeData

  return (
    <BaseNode {...props} type="image" hasInput={true} hasOutput={true}>
      {data.outputUrl ? (
        <img src={data.outputUrl} alt="生成结果" className="h-28 w-full rounded-lg object-cover" />
      ) : (
        <NodePlaceholder icon="🖼" text={data.prompt ? data.prompt.slice(0, 60) : '等待生成图片...'} />
      )}
    </BaseNode>
  )
}
