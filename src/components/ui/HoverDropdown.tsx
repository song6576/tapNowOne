/** 通用下拉：hover 或 click 模式，支持 ESC / 外部点击关闭 */
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const panelWrapRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const [flipped, setFlipped] = useState(false)

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
      // 延迟关闭前再确认指针是否仍在容器内，避免边缘抖动误关
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

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  useEffect(() => {
    if (mode !== 'click' || !open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [mode, open, setOpen])

  useEffect(() => {
    if (!open) {
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
      const pad = 12
      if (side === 'right') {
        setFlipped(panelRect.right > window.innerWidth - pad)
      } else if (side === 'bottom') {
        setFlipped(panelRect.bottom > window.innerHeight - pad)
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, side, children, allowFlip])

  const panelPositionClass =
    side === 'right'
      ? flipped
        ? 'right-full bottom-0 flex flex-row-reverse items-end'
        : 'left-full bottom-0 flex flex-row items-end'
      : flipped
        ? 'bottom-full flex flex-col-reverse'
        : `top-full flex flex-col ${align === 'right' ? 'right-0' : 'left-0'}`

  return (
    <div
      ref={ref}
      className={`relative inline-flex ${className}`}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div onClick={handleTriggerClick} className={mode === 'click' ? 'contents' : undefined}>
        {trigger}
      </div>
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
        <div className={`dropdown-panel pointer-events-auto ${panelClassName}`}>{children}</div>
      </div>
    </div>
  )
}
