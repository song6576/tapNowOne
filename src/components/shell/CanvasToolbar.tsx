/** 画布左侧浮动工具栏：添加各类型节点 */
import { UserMenuDropdown } from '../home/UserMenuDropdown'
import type { NodeType } from '../../types'
import { Tooltip } from '../ui/Tooltip'
import { useI18n } from '../../store/langStore'

interface CanvasToolbarProps {
  onAddNode: (type: NodeType | 'group') => void
  onOpenAddMenu?: () => void
  onOpenAgent?: () => void
}

const TOOLS = [
  { icon: 'chat', tipKey: 'messages' as const },
] as const

function ToolIcon({ type }: { type: typeof TOOLS[number]['icon'] }) {
  const cls = 'h-[18px] w-[18px]'
  if (type !== 'chat') return null
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function CanvasToolbar({ onAddNode, onOpenAddMenu, onOpenAgent }: CanvasToolbarProps) {
  const { t } = useI18n()
  const tips = t.canvas.tooltips

  return (
    <aside className="canvas-float-sidebar pointer-events-auto">
      <Tooltip label={tips.addNode} side="right">
        <button
          type="button"
          onClick={onOpenAddMenu ?? (() => onAddNode('text'))}
          className="canvas-float-add ui-clickable"
          aria-label={tips.addNode}
        >
          +
        </button>
      </Tooltip>
      {TOOLS.map((tool) => (
        <Tooltip key={tool.icon} label={tips[tool.tipKey]} side="right">
          <button
            type="button"
            className="canvas-float-btn ui-clickable"
            onClick={tool.icon === 'chat' ? onOpenAgent : undefined}
            aria-label={tips[tool.tipKey]}
          >
            <ToolIcon type={tool.icon} />
          </button>
        </Tooltip>
      ))}
      <UserMenuDropdown variant="avatar" />
    </aside>
  )
}
