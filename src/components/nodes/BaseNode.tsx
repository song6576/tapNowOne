/** 节点通用外壳：Handle、生成状态遮罩 */
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeData, NodeType } from '../../types'
import { NODE_META } from '../../types'

interface BaseNodeProps extends NodeProps {
  type: NodeType
  hasInput?: boolean
  hasOutput?: boolean
  children?: React.ReactNode
}

const STATUS_DOT: Record<NodeData['status'], string> = {
  idle: 'bg-zinc-600',
  generating: 'bg-amber-400 animate-pulse',
  done: 'bg-emerald-400',
  error: 'bg-red-400',
}

export function BaseNode({ type, hasInput = false, hasOutput = true, selected, data, children }: BaseNodeProps) {
  const meta = NODE_META[type]
  const nodeData = data as NodeData
  const generating = nodeData.status === 'generating'

  return (
    <div
      className={`relative min-w-[240px] overflow-hidden rounded-xl border bg-[var(--tn-bg-panel)] shadow-lg transition-all ${
        selected ? 'border-zinc-400 ring-1 ring-zinc-500/30' : 'border-[var(--tn-border)]'
      }`}
      style={{ borderTopColor: meta.color, borderTopWidth: 2 }}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-2 !border-[var(--tn-bg-panel)] !bg-zinc-400"
        />
      )}

      <div className="flex items-center gap-2 border-b border-[var(--tn-border-subtle)] px-3 py-2">
        <span className="text-sm">{meta.icon}</span>
        <span className="flex-1 text-xs font-medium text-[var(--tn-text-secondary)]">
          {nodeData.label || meta.label}
        </span>
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[nodeData.status]}`} />
      </div>

      <div className="p-3">{children}</div>

      {generating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
          <span className="rounded-full bg-[var(--tn-bg-panel)] px-3 py-1 text-[10px] text-[var(--tn-node-video)] animate-pulse">
            Generating...
          </span>
        </div>
      )}

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2.5 !w-2.5 !border-2 !border-[var(--tn-bg-panel)] !bg-zinc-400"
        />
      )}
    </div>
  )
}
