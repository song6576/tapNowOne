import { useCallback, useEffect, useRef, useState } from 'react'

interface HoverDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
  panelClassName?: string
}

export function HoverDropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  panelClassName = '',
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
    clearCloseTimer()
    setOpen(true)
  }

  const handleLeave = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  return (
    <div
      ref={ref}
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {trigger}
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
