/** 画布左侧浮动工具栏：添加各类型节点 */
import type { NodeType } from '../../types'

interface CanvasToolbarProps {
  onAddNode: (type: NodeType | 'group') => void
}

const TOOLS = [
  { icon: 'search', title: 'Search' },
  { icon: 'folder', title: 'Projects' },
  { icon: 'star', title: 'Favorites' },
  { icon: 'chat', title: 'Messages' },
  { icon: 'users', title: 'Collaborators' },
  { icon: 'clock', title: 'History' },
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

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  return (
    <aside className="canvas-float-sidebar pointer-events-auto">
      <button type="button" title="Add" onClick={() => onAddNode('text')} className="canvas-float-add ui-clickable">
        +
      </button>
      {TOOLS.map((tool) => (
        <button key={tool.icon} type="button" title={tool.title} className="canvas-float-btn ui-clickable">
          <ToolIcon type={tool.icon} />
        </button>
      ))}
      <button type="button" className="canvas-float-avatar ui-clickable" title="Profile">
        <span className="text-[10px] font-bold text-white">TN</span>
      </button>
    </aside>
  )
}
