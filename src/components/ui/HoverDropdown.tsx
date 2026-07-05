/** 通用下拉：hover 或 click 模式，支持 ESC / 外部点击关闭；click 模式用 Portal 避免画布滚轮劫持 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface HoverDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  /** 面板相对触发器的位置 */
  side?: 'bottom' | 'right'
  className?: string
  panelClassName?: string
  /** hover：悬浮打开；click：点击打开（适合表单内选择） */
  mode?: 'hover' | 'click'
  /** 受控开关；传入时配合 onOpenChange 使用 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** hover 模式下关闭延迟（ms），默认 200 */
  closeDelay?: number
  /** 是否允许贴边时自动翻转方向，默认 true */
  allowFlip?: boolean
}

type PortalPosition = {
  top: number
  left: number
}

const PANEL_MAX_HEIGHT = 420
const VIEWPORT_PAD = 12

function blockFlowInteraction(e: React.SyntheticEvent) {
  e.stopPropagation()
}

function DropdownPanel({
  panelRef,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  children,
}: {
  panelRef?: React.Ref<HTMLDivElement>
  className: string
  style?: React.CSSProperties
  onPointerEnter?: () => void
  onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void
  children: React.ReactNode
}) {
  return (
    <div
      ref={panelRef}
      style={style}
      className={`dropdown-panel pointer-events-auto nowheel nopan nodrag ${className}`}
      onWheel={blockFlowInteraction}
      onWheelCapture={blockFlowInteraction}
      onPointerDown={blockFlowInteraction}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  )
}

export function HoverDropdown({
  trigger,
  children,
  align = 'right',
  side = 'bottom',
  className = '',
  panelClassName = '',
  mode = 'hover',
  open: openProp,
  onOpenChange,
  closeDelay = 200,
  allowFlip = true,
}: HoverDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const setOpen = useCallback((next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }, [isControlled, onOpenChange])

  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelWrapRef = useRef<HTMLDivElement>(null)
  const portalPanelRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [portalPos, setPortalPos] = useState<PortalPosition>({ top: 0, left: 0 })

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = useCallback(() => {
    if (mode !== 'hover') return
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      const el = ref.current
      if (el?.matches(':hover')) return
      setOpen(false)
    }, closeDelay)
  }, [mode, closeDelay, setOpen])

  const handleEnter = () => {
    if (mode !== 'hover') return
    clearCloseTimer()
    setOpen(true)
  }

  const handleLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (mode !== 'hover') return
    const related = e.relatedTarget
    if (related instanceof Node && ref.current?.contains(related)) return
    scheduleClose()
  }

  const handleTriggerClick = () => {
    if (mode === 'click') setOpen(!open)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [setOpen])

  const updatePortalPosition = useCallback(() => {
    const triggerEl = triggerRef.current
    if (!triggerEl) return

    const rect = triggerEl.getBoundingClientRect()
    const panel = portalPanelRef.current
    const panelWidth = panel?.offsetWidth ?? 260
    const panelHeight = panel?.offsetHeight ?? PANEL_MAX_HEIGHT

    let top = rect.bottom + 6
    let left = align === 'right' ? rect.right - panelWidth : rect.left

    if (allowFlip && side === 'bottom' && top + panelHeight > window.innerHeight - VIEWPORT_PAD) {
      top = Math.max(VIEWPORT_PAD, rect.top - panelHeight - 6)
    }

    left = Math.min(Math.max(VIEWPORT_PAD, left), window.innerWidth - panelWidth - VIEWPORT_PAD)
    top = Math.min(Math.max(VIEWPORT_PAD, top), window.innerHeight - panelHeight - VIEWPORT_PAD)

    setPortalPos({ top, left })
  }, [align, side, allowFlip])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  useEffect(() => {
    if (mode !== 'click' || !open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (portalPanelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [mode, open, setOpen])

  useLayoutEffect(() => {
    if (mode !== 'click' || !open) return
    updatePortalPosition()
    const panel = portalPanelRef.current
    if (!panel) return

    const observer = new ResizeObserver(() => updatePortalPosition())
    observer.observe(panel)
    window.addEventListener('resize', updatePortalPosition)
    window.addEventListener('scroll', updatePortalPosition, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePortalPosition)
      window.removeEventListener('scroll', updatePortalPosition, true)
    }
  }, [mode, open, updatePortalPosition, children])

  useEffect(() => {
    if (mode === 'click' || !open) {
      setFlipped(false)
      return
    }
    if (!allowFlip) {
      setFlipped(false)
      return
    }
    const id = window.requestAnimationFrame(() => {
      const panel = panelWrapRef.current?.querySelector('.dropdown-panel') as HTMLElement | null
      if (!panel) return
      const panelRect = panel.getBoundingClientRect()
      if (side === 'right') {
        setFlipped(panelRect.right > window.innerWidth - VIEWPORT_PAD)
      } else if (side === 'bottom') {
        setFlipped(panelRect.bottom > window.innerHeight - VIEWPORT_PAD)
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [mode, open, side, children, allowFlip])

  const panelPositionClass =
    side === 'right'
      ? flipped
        ? 'right-full bottom-0 flex flex-row-reverse items-end'
        : 'left-full bottom-0 flex flex-row items-end'
      : flipped
        ? 'bottom-full flex flex-col-reverse'
        : `top-full flex flex-col ${align === 'right' ? 'right-0' : 'left-0'}`

  const portalPanel =
    mode === 'click' && open
      ? createPortal(
          <DropdownPanel
            panelRef={portalPanelRef}
            className={panelClassName}
            style={{ position: 'fixed', top: portalPos.top, left: portalPos.left, zIndex: 200 }}
          >
            {children}
          </DropdownPanel>,
          document.body,
        )
      : null

  return (
    <div
      ref={ref}
      className={`relative inline-flex nowheel nopan nodrag ${className}`}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={mode === 'click' ? 'inline-flex' : undefined}
      >
        {trigger}
      </div>

      {mode === 'hover' && (
        <div
          ref={panelWrapRef}
          className={`absolute z-50 transition-opacity duration-100 pointer-events-none ${panelPositionClass} ${
            open ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
          aria-hidden={!open}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
        >
          {side === 'bottom' && !flipped && <div className="-mt-1 h-3 pointer-events-auto" aria-hidden />}
          {side === 'bottom' && flipped && <div className="h-3 pointer-events-auto" aria-hidden />}
          {side === 'right' && !flipped && <div className="w-2 shrink-0 self-stretch pointer-events-auto" aria-hidden />}
          {side === 'right' && flipped && <div className="w-2 shrink-0 self-stretch pointer-events-auto" aria-hidden />}
          <DropdownPanel className={panelClassName}>{children}</DropdownPanel>
        </div>
      )}

      {portalPanel}
    </div>
  )
}
