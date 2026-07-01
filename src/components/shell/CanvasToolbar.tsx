import { NODE_MENU_ITEMS } from '../../mock/data'
import type { NodeType } from '../../types'

interface CanvasToolbarProps {
  onAddNode: (type: NodeType | 'group') => void
  onLoadDemo?: () => void
}

export function CanvasToolbar({ onAddNode, onLoadDemo }: CanvasToolbarProps) {
  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-0.5 border-r border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] py-2">
      {NODE_MENU_ITEMS.map((item) => (
        <button
          key={item.type}
          type="button"
          title={`${item.label} — ${item.desc}`}
          onClick={() => onAddNode(item.type as NodeType | 'group')}
          className="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-[var(--tn-text-muted)] transition-colors hover:bg-[var(--tn-bg-hover)] hover:text-white"
        >
          <span className="text-base leading-none">{item.icon}</span>
        </button>
      ))}

      <div className="my-2 h-px w-6 bg-[var(--tn-border-subtle)]" />

      <button
        type="button"
        title="Load demo workflow"
        onClick={onLoadDemo}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--tn-text-muted)] hover:bg-[var(--tn-bg-hover)] hover:text-[var(--tn-node-video)]"
      >
        ⚡
      </button>
    </aside>
  )
}
