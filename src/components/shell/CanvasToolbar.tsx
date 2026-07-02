import { NODE_MENU_ITEMS } from '../../mock/data'
import type { NodeType } from '../../types'

interface CanvasToolbarProps {
  onAddNode: (type: NodeType | 'group') => void
  onLoadDemo?: () => void
}

const EXTRA_TOOLS = [
  { icon: '🔍', title: 'Search' },
  { icon: '📁', title: 'Assets' },
  { icon: '▦', title: 'Layers' },
  { icon: 'T', title: 'Text' },
  { icon: '🕐', title: 'History' },
] as const

export function CanvasToolbar({ onAddNode, onLoadDemo }: CanvasToolbarProps) {
  return (
    <aside className="canvas-sidebar flex w-12 shrink-0 flex-col items-center gap-1 border-r border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] py-3">
      <button
        type="button"
        title="Add node"
        onClick={() => onAddNode('text')}
        className="canvas-sidebar-add ui-clickable"
      >
        +
      </button>

      {EXTRA_TOOLS.map((tool) => (
        <button
          key={tool.title}
          type="button"
          title={tool.title}
          className="canvas-sidebar-btn ui-clickable"
        >
          <span className="text-sm leading-none">{tool.icon}</span>
        </button>
      ))}

      <div className="my-1 h-px w-6 bg-[var(--tn-border-subtle)]" />

      {NODE_MENU_ITEMS.slice(0, 3).map((item) => (
        <button
          key={item.type}
          type="button"
          title={`${item.label} — ${item.desc}`}
          onClick={() => onAddNode(item.type as NodeType | 'group')}
          className="canvas-sidebar-btn ui-clickable"
        >
          <span className="text-sm leading-none">{item.icon}</span>
        </button>
      ))}

      <div className="mt-auto">
        <button
          type="button"
          title="Load demo workflow"
          onClick={onLoadDemo}
          className="canvas-sidebar-accent ui-clickable"
        >
          ⚡
        </button>
      </div>
    </aside>
  )
}
