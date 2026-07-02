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
}

export function HoverDropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  panelClassName = '',
  mode = 'hover',
}: HoverDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const handleEnter = () => {
    if (mode !== 'hover') return
    clearCloseTimer()
    setOpen(true)
  }

  const handleLeave = () => {
    if (mode !== 'hover') return
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  const handleTriggerClick = () => {
    if (mode === 'click') setOpen((v) => !v)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [])

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
  }, [mode, open])

  return (
    <div
      ref={ref}
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div onClick={handleTriggerClick} className={mode === 'click' ? 'contents' : undefined}>
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute top-full z-50 pt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className={`dropdown-panel ${panelClassName}`}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
