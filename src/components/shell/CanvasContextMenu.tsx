/** 画布添加节点菜单：双击/右键唤起，分区展示节点与资源 */
import { useEffect, useRef, useState } from 'react'
import type { NodeType } from '../../types'
import { useI18n } from '../../store/langStore'

export type CanvasAddAction = NodeType | 'group' | 'upload'

interface CanvasContextMenuProps {
  x: number
  y: number
  onAdd: (type: CanvasAddAction) => void
  onClose: () => void
}

function MenuIcon({ type }: { type: string }) {
  const cls = 'h-[18px] w-[18px] shrink-0'
  switch (type) {
    case 'text':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
        </svg>
      )
    case 'image':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="M21 15l-5-5L8 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'video':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M10 9.5l5 3-5 3v-6z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'audio':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M7 8v8M11 6v12M15 9v6M19 7v10" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 16V4M8 8l4-4 4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

interface MenuRowProps {
  icon: string
  label: string
  desc?: string
  dot?: boolean
  onClick: () => void
}

function MenuRow({ icon, label, desc, dot, onClick }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canvas-add-menu-item ui-clickable"
      role="menuitem"
    >
      <span className="canvas-add-menu-icon-wrap">
        {dot && <span className="canvas-add-menu-dot" aria-hidden />}
        <MenuIcon type={icon} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="text-sm text-white/90">{label}</span>
        </span>
        {desc && <span className="mt-0.5 block text-[11px] leading-snug text-white/35">{desc}</span>}
      </span>
    </button>
  )
}

export function CanvasContextMenu({ x, y, onAdd, onClose }: CanvasContextMenuProps) {
  const { t } = useI18n()
  const m = t.canvas.nodeMenu
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const pad = 12
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - pad) left = window.innerWidth - rect.width - pad
    if (top + rect.height > window.innerHeight - pad) top = window.innerHeight - rect.height - pad
    left = Math.max(pad, left)
    top = Math.max(pad, top)
    setPos({ left, top })
    panel.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
  }, [x, y])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const add = (type: CanvasAddAction) => {
    onAdd(type)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <div
        ref={panelRef}
        className="canvas-add-menu fixed z-50"
        style={{ left: pos.left, top: pos.top }}
        role="menu"
        aria-label={m.addNode}
      >
        <p className="canvas-add-menu-section">{m.addNode}</p>
        <MenuRow
          icon="text"
          label={m.text}
          desc={m.textDesc}
          onClick={() => add('text')}
        />
        <MenuRow icon="image" label={m.image} onClick={() => add('image')} />
        <MenuRow icon="video" label={m.video} onClick={() => add('video')} />
        <MenuRow icon="audio" label={m.audio} dot onClick={() => add('audio')} />

        <p className="canvas-add-menu-section">{m.resources}</p>
        <MenuRow icon="upload" label={m.upload} onClick={() => add('upload')} />
      </div>
    </>
  )
}
