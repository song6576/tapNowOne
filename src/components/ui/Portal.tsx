/** 将子节点渲染到 document.body，避免 fixed 弹窗被父级 transform/filter 截断 */
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
