/** 通用下拉：hover 或 click 模式，支持 ESC / 外部点击关闭 */
import { useCallback, useEffect, useRef, useState } from 'react'

interface HoverDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
  panelClassName?: string
  /** hover：悬浮打开；click：点击打开（适合表单内选择） */
  mode?: 'hover' | 'click'
  /** 受控开关；传入时配合 onOpenChange 使用 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** hover 模式下关闭延迟（ms），默认 200 */
  closeDelay?: number
}

export function HoverDropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  panelClassName = '',
  mode = 'hover',
  open: openProp,
  onOpenChange,
  closeDelay = 200,
}: HoverDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const setOpen = useCallback((next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }, [isControlled, onOpenChange])
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

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
        className={`absolute top-full z-50 transition-opacity duration-100 ${align === 'right' ? 'right-0' : 'left-0'} ${
          open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
      >
        {/* 透明桥接区：与 trigger 重叠，消除移动过程中的 hover 断档 */}
        <div className="-mt-1 h-3" aria-hidden />
        <div className={`dropdown-panel ${panelClassName}`}>{children}</div>
      </div>
    </div>
  )
}
