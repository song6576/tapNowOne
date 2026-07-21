/** 多选工具栏（打组）/ 组选中工具栏（解组、命名）— 贴近选区上方 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactFlow, useViewport } from '@xyflow/react'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { buildNodesById, getAbsolutePosition, getNodeSize } from '../../utils/nodeBounds'

const TOOLBAR_GAP = 12
const TOOLBAR_HEIGHT = 42

export function CanvasSelectionToolbar() {
  const { t } = useI18n()
  const bar = t.canvas.selectionBar
  const nodes = useCanvasStore((s) => s.nodes)
  const groupSelected = useCanvasStore((s) => s.groupSelected)
  const ungroupNode = useCanvasStore((s) => s.ungroupNode)
  const renameGroup = useCanvasStore((s) => s.renameGroup)
  const showToast = useToastStore((s) => s.showToast)
  const { flowToScreenPosition } = useReactFlow()
  useViewport()

  const selected = useMemo(() => nodes.filter((n) => n.selected), [nodes])
  const selectedGroups = useMemo(
    () => selected.filter((n) => n.type === 'group'),
    [selected],
  )
  const selectedLeaf = useMemo(
    () => selected.filter((n) => n.type !== 'group'),
    [selected],
  )

  const activeGroup =
    selected.length === 1 && selectedGroups.length === 1 ? selectedGroups[0]! : null
  const canGroup = !activeGroup && selectedLeaf.length >= 2

  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRenameRef = useRef(false)

  useEffect(() => {
    setRenaming(false)
    setDraftName('')
  }, [activeGroup?.id, canGroup])

  useEffect(() => {
    if (renaming) {
      cancelRenameRef.current = false
      setDraftName(activeGroup?.data.label || 'Group')
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [renaming, activeGroup?.data.label])

  const anchorStyle = (() => {
    if (!canGroup && !activeGroup) return null
    const targets = activeGroup ? [activeGroup] : selectedLeaf
    if (targets.length === 0) return null

    const byId = buildNodesById(nodes)
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    for (const node of targets) {
      const abs = getAbsolutePosition(node, byId)
      const { w } = getNodeSize(node)
      minX = Math.min(minX, abs.x)
      minY = Math.min(minY, abs.y)
      maxX = Math.max(maxX, abs.x + w)
    }

    const topCenter = flowToScreenPosition({ x: (minX + maxX) / 2, y: minY })
    return {
      left: topCenter.x,
      top: Math.max(8, topCenter.y - TOOLBAR_HEIGHT - TOOLBAR_GAP),
    }
  })()

  if ((!canGroup && !activeGroup) || !anchorStyle) return null

  const commitRename = () => {
    if (!activeGroup) return
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false
      return
    }
    renameGroup(activeGroup.id, draftName)
    setRenaming(false)
  }

  return (
    <div
      className="canvas-selection-toolbar pointer-events-auto nowheel nopan nodrag"
      role="toolbar"
      aria-label={activeGroup ? bar.ungroup : bar.group}
      style={{ left: anchorStyle.left, top: anchorStyle.top }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {canGroup && (
        <button
          type="button"
          className="canvas-selection-toolbar-btn ui-clickable"
          aria-keyshortcuts="Meta+G Control+G"
          onClick={() => {
            const id = groupSelected()
            if (id) showToast({ type: 'success', message: bar.grouped })
          }}
        >
          <GroupIcon />
          <span>{bar.group}</span>
        </button>
      )}

      {activeGroup && (
        <>
          <button
            type="button"
            className="canvas-selection-toolbar-btn ui-clickable"
            aria-keyshortcuts="Meta+Shift+G Control+Shift+G"
            onClick={() => {
              if (ungroupNode(activeGroup.id)) {
                showToast({ type: 'success', message: bar.ungrouped })
              }
            }}
          >
            <UngroupIcon />
            <span>{bar.ungroup}</span>
          </button>
          {renaming ? (
            <form
              className="canvas-selection-toolbar-rename"
              onSubmit={(e) => {
                e.preventDefault()
                commitRename()
              }}
            >
              <input
                ref={inputRef}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelRenameRef.current = true
                    setRenaming(false)
                  }
                }}
                className="canvas-selection-toolbar-input"
                aria-label={bar.rename}
              />
            </form>
          ) : (
            <button
              type="button"
              className="canvas-selection-toolbar-btn ui-clickable"
              onClick={() => setRenaming(true)}
            >
              <RenameIcon />
              <span>{bar.rename}</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

function GroupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h7v7H3zM14 7h7v7h-7zM8 14h8v7H8z" strokeLinejoin="round" />
    </svg>
  )
}

function UngroupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6z" strokeLinejoin="round" />
      <path d="M10 11l4-4M10 13l4 4" strokeLinecap="round" />
    </svg>
  )
}

function RenameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h4L18 10l-4-4L4 16v4z" strokeLinejoin="round" />
      <path d="M13 7l4 4" strokeLinecap="round" />
    </svg>
  )
}
