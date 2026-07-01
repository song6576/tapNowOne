import type { NodeProps } from '@xyflow/react'
import type { NodeData } from '../../types'
import { BaseNode } from './BaseNode'

export function TextNode(props: NodeProps) {
  const data = props.data as NodeData
  const preview = data.outputText || data.prompt || '点击右侧面板编辑文本...'

  return (
    <BaseNode {...props} type="text" hasInput={false} hasOutput={true}>
      <div className="max-h-24 overflow-hidden text-xs leading-relaxed text-[var(--tn-text-secondary)]">
        {preview.slice(0, 120)}
        {preview.length > 120 ? '...' : ''}
      </div>
    </BaseNode>
  )
}
