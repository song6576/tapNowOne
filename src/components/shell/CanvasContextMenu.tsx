/** 画布右键菜单：在点击位置添加节点 */
import { NODE_MENU_ITEMS } from '../../mock/data'
import type { NodeType } from '../../types'

interface CanvasContextMenuProps {
  x: number
  y: number
  onAdd: (type: NodeType | 'group') => void
  onClose: () => void
}

export function CanvasContextMenu({ x, y, onAdd, onClose }: CanvasContextMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <div
        className="fixed z-50 min-w-[180px] rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] py-1 shadow-2xl"
        style={{ left: x, top: y }}
      >
        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">Add Node</p>
        {NODE_MENU_ITEMS.map((item) => (
          <button
            key={item.type}
            type="button"
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--tn-text-secondary)] hover:bg-[var(--tn-bg-hover)] hover:text-white"
            onClick={() => { onAdd(item.type as NodeType | 'group'); onClose() }}
          >
            <span className="w-5 text-center">{item.icon}</span>
            <div>
              <p>{item.label}</p>
              <p className="text-[10px] text-[var(--tn-text-muted)]">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
