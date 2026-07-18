/** 节点通用外壳：图3 风格卡片 + 选中时内联对话框（随画布缩放）+ 空媒体节点顶部上传 */
import { useRef, useState } from 'react'
import { Handle, NodeToolbar, Position, useViewport, type NodeProps } from '@xyflow/react'
import { useParams } from 'react-router-dom'
import type { NodeData, NodeType } from '../../types'
import { NODE_META } from '../../types'
import { useI18n } from '../../store/langStore'
import { useCanvasStore } from '../../store/canvasStore'
import { useToastStore } from '../../store/toastStore'
import { uploadProjectAsset } from '../../api/client'
import { getToken } from '../../utils/auth'
import { NodeHeaderIcon } from './NodeTypeIcon'
import { NodeInlineEditor } from './NodeInlineEditor'

interface BaseNodeProps extends NodeProps {
  type: NodeType
  hasInput?: boolean
  hasOutput?: boolean
  /** 有内容时隐藏类型标题，媒体铺满 */
  filled?: boolean
  children?: React.ReactNode
}

export function BaseNode({
  id,
  type,
  hasInput = false,
  hasOutput = true,
  selected,
  data,
  filled = false,
  children,
}: BaseNodeProps) {
  const meta = NODE_META[type]
  const nodeData = data as NodeData
  const generating = nodeData.status === 'generating'
  const { t } = useI18n()
  const { zoom } = useViewport()
  const { projectId } = useParams()
  const fillNodeWithAsset = useCanvasStore((s) => s.fillNodeWithAsset)
  const showToast = useToastStore((s) => s.showToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const isEmptyMedia =
    (type === 'image' || type === 'video') && !nodeData.outputUrl
  const showUpload = !!selected && isEmptyMedia && !generating
  const accept = type === 'video' ? 'video/*' : 'image/*'
  const showHeader = !filled

  const handleUploadClick = () => {
    if (!getToken()) {
      showToast({ type: 'info', message: t.canvas.nodeEditor.loginRequired })
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadProjectAsset(file, projectId)
      fillNodeWithAsset(id, result.url, result.filename)
      showToast({ type: 'success', message: t.canvas.nodeEditor.uploadSuccess })
    } catch (err) {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : t.canvas.nodeEditor.uploadFailed,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={[
        'canvas-node',
        `canvas-node--${type}`,
        selected ? 'canvas-node--selected' : '',
        generating ? 'canvas-node--generating' : '',
        filled ? 'canvas-node--filled' : '',
      ].filter(Boolean).join(' ')}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="canvas-node-handle canvas-node-handle--left"
          isConnectable
        />
      )}

      <div className="canvas-node-card">
        {showHeader && (
          <div className="canvas-node-header">
            <NodeHeaderIcon type={type} />
            <span className="canvas-node-label">{nodeData.label || meta.label}</span>
          </div>
        )}
        <div className={`canvas-node-body ${filled ? 'canvas-node-body--filled' : ''}`}>
          {children}
        </div>
      </div>

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="canvas-node-handle canvas-node-handle--right"
          isConnectable
        />
      )}

      {generating && (
        <div className="canvas-node-loading" aria-live="polite">
          <div className="canvas-node-thinking">
            <span className="canvas-node-thinking-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="canvas-node-thinking-label">{t.canvas.nodeEditor.thinking}</span>
          </div>
        </div>
      )}

      <NodeToolbar position={Position.Top} offset={10 * zoom} isVisible={showUpload}>
        <div
          className="node-upload-btn-scale"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'bottom center' }}
        >
          <button
            type="button"
            className="node-upload-btn ui-clickable nowheel nopan nodrag"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{uploading ? t.canvas.nodeEditor.uploading : t.canvas.nodeEditor.upload}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
        </div>
      </NodeToolbar>

      <NodeToolbar position={Position.Bottom} offset={12 * zoom} isVisible={!!selected}>
        <div
          className="node-inline-editor-scale"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          <NodeInlineEditor nodeId={id} type={type} data={nodeData} />
        </div>
      </NodeToolbar>
    </div>
  )
}

