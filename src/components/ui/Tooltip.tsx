/** 悬浮提示：支持上下左右四个方向 */
import type { ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function Tooltip({ label, children, side = 'top', className = '' }: TooltipProps) {
  return (
    <span className={`ui-tooltip-wrap ui-tooltip-wrap--${side} ${className}`.trim()}>
      {children}
      <span className="ui-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  )
}
