/** 节点右键菜单：只展示当前可交付的复制 / 粘贴 / 下载 / 删除能力 */
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../store/langStore'

export type NodeContextAction = 'copy' | 'paste' | 'delete' | 'download'

interface NodeContextMenuProps {
  x: number
  y: number
  canPaste: boolean
  canDownload: boolean
  onAction: (action: NodeContextAction) => void
  onClose: () => void
}

function isMacPlatform() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

function MenuItem({
  label,
  shortcut,
  disabled,
  onClick,
}: {
  label: string
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`node-ctx-menu-item ${disabled ? 'node-ctx-menu-item--disabled' : 'ui-clickable'}`}
      role="menuitem"
    >
      <span className="node-ctx-menu-label">{label}</span>
      {shortcut && <span className="node-ctx-menu-shortcut">{shortcut}</span>}
    </button>
  )
}

function MenuDivider() {
  return <div className="node-ctx-menu-divider" role="separator" />
}

export function NodeContextMenu({
  x,
  y,
  canPaste,
  canDownload,
  onAction,
  onClose,
}: NodeContextMenuProps) {
  const { t } = useI18n()
  const m = t.canvas.nodeContextMenu
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })
  const mod = isMacPlatform() ? '⌘' : 'Ctrl+'

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
    panel.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus()
  }, [x, y])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const run = (action: NodeContextAction) => {
    onAction(action)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div
        ref={panelRef}
        className="node-ctx-menu fixed z-50"
        style={{ left: pos.left, top: pos.top }}
        role="menu"
      >
        <MenuItem label={m.copy} shortcut={`${mod}C`} onClick={() => run('copy')} />
        <MenuItem
          label={m.paste}
          shortcut={`${mod}V`}
          disabled={!canPaste}
          onClick={() => run('paste')}
        />
        <MenuItem
          label={m.download}
          disabled={!canDownload}
          onClick={() => run('download')}
        />
        <MenuDivider />
        <MenuItem label={m.delete} shortcut="⌫, del" onClick={() => run('delete')} />
      </div>
    </>
  )
}
