/** NodeToolbar 在屏幕空间渲染；高 zoom 时手动放大以跟上节点，低 zoom 保持可读点击尺寸 */
import type { CSSProperties, ReactNode } from 'react'
import { useViewport } from '@xyflow/react'

type Props = {
  children: ReactNode
  className?: string
  /** 缩放原点：底栏贴节点下沿用 top，顶栏上传用 bottom */
  origin?: 'top center' | 'bottom center'
}

export function NodeToolbarZoomScale({
  children,
  className,
  origin = 'top center',
}: Props) {
  const { zoom } = useViewport()
  // zoom < 1：保持 1（NodeToolbar 已是屏幕尺寸，避免再缩小）
  // zoom > 1：按 zoom 放大，避免对话框相对节点过小
  const scale = zoom > 1 ? zoom : 1
  const style: CSSProperties = {
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: origin,
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
