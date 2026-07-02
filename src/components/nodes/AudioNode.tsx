/** 音频生成节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'

export function AudioNode(props: NodeProps) {
  const data = props.data as NodeData

  return (
    <BaseNode {...props} type="audio" hasInput={true} hasOutput={false}>
      {data.outputUrl ? (
        <audio src={data.outputUrl} controls className="w-full" />
      ) : (
        <div className="flex h-16 items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--tn-border)] bg-[var(--tn-bg)] text-[11px] text-[var(--tn-text-muted)]">
          <span>🔊</span>
          <span>TTS 配音</span>
        </div>
      )}
    </BaseNode>
  )
}
