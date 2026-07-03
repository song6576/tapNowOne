/** 画布左侧浮动工具栏：添加各类型节点 */
import { UserMenuDropdown } from '../home/UserMenuDropdown'
import type { NodeType } from '../../types'
import { Tooltip } from '../ui/Tooltip'
import { useI18n } from '../../store/langStore'

interface CanvasToolbarProps {
  onAddNode: (type: NodeType | 'group') => void
  onOpenAddMenu?: () => void
}

const TOOLS = [
  { icon: 'search', tipKey: 'search' as const },
  { icon: 'folder', tipKey: 'projects' as const },
  { icon: 'star', tipKey: 'favorites' as const },
  { icon: 'chat', tipKey: 'messages' as const },
  { icon: 'users', tipKey: 'collaborators' as const },
  { icon: 'clock', tipKey: 'history' as const },
] as const

function ToolIcon({ type }: { type: typeof TOOLS[number]['icon'] }) {
  const cls = 'h-[18px] w-[18px]'
  switch (type) {
    case 'search':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      )
    case 'folder':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'star':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    case 'chat':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'users':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
      )
  }
}

export function CanvasToolbar({ onAddNode, onOpenAddMenu }: CanvasToolbarProps) {
  const { t } = useI18n()
  const tips = t.canvas.tooltips

  return (
    <aside className="canvas-float-sidebar pointer-events-auto">
      <Tooltip label={tips.addNode} side="right">
        <button type="button" onClick={onOpenAddMenu ?? (() => onAddNode('text'))} className="canvas-float-add ui-clickable">
          +
        </button>
      </Tooltip>
      {TOOLS.map((tool) => (
        <Tooltip key={tool.icon} label={tips[tool.tipKey]} side="right">
          <button type="button" className="canvas-float-btn ui-clickable">
            <ToolIcon type={tool.icon} />
          </button>
        </Tooltip>
      ))}
      <UserMenuDropdown variant="avatar" />
    </aside>
  )
}
