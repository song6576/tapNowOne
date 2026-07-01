import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'

function isImagePreview(url: string) {
  return /\.(svg|png|jpe?g|webp)(\?|$)/i.test(url) || url.startsWith('data:image/')
}

export function VideoNode(props: NodeProps) {
  const data = props.data as NodeData

  return (
    <BaseNode {...props} type="video" hasInput={true} hasOutput={true}>
      {data.outputUrl ? (
        isImagePreview(data.outputUrl) ? (
          <img src={data.outputUrl} alt="视频预览" className="h-28 w-full rounded-lg object-cover" />
        ) : (
          <video src={data.outputUrl} className="h-28 w-full rounded-lg object-cover" controls muted />
        )
      ) : (
        <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--tn-border)] bg-[var(--tn-bg)] text-[11px] text-[var(--tn-text-muted)]">
          <span className="text-base opacity-60">🎬</span>
          <span>{data.duration ? `${data.duration}s clip` : '4s clip'}</span>
        </div>
      )}
    </BaseNode>
  )
}
