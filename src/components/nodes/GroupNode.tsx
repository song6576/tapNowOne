/** 分组容器节点 */
import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'

export function GroupNode({ data, selected }: NodeProps) {
  const nodeData = data as NodeData

  return (
    <div
      className={`h-full w-full rounded-2xl border-2 border-dashed transition-colors ${
        selected
          ? 'border-[var(--tn-text-muted)] bg-[var(--tn-bg-hover)]/30'
          : 'border-[var(--tn-border)] bg-[var(--tn-bg-panel)]/20'
      }`}
    >
      <div className="absolute -top-7 left-2 flex items-center gap-1.5 rounded-md bg-[var(--tn-bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--tn-text-muted)]">
        <span>▦</span>
        {nodeData.label || 'Group'}
      </div>
    </div>
  )
}
