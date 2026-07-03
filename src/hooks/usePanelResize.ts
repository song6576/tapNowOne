import { useCallback, useEffect, useState } from 'react'

/** 右侧面板左边缘拖拽调宽 */
export function usePanelResize({
  defaultWidth = 420,
  minWidth = 300,
  maxRatio = 0.62,
}: {
  defaultWidth?: number
  minWidth?: number
  maxRatio?: number
} = {}) {
  const [width, setWidth] = useState(defaultWidth)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      const max = Math.floor(window.innerWidth * maxRatio)
      const next = Math.min(max, Math.max(minWidth, window.innerWidth - e.clientX))
      setWidth(next)
    }

    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, minWidth, maxRatio])

  return { width, dragging, onPointerDown }
}
