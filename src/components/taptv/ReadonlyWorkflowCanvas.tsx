/** TapTV 只读创作过程画布：不可编辑，仅浏览节点流程 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type OnMove,
} from '@xyflow/react'
import type { CanvasProject } from '../../types'
import { nodeTypes } from '../nodes'
import { Tooltip } from '../ui/Tooltip'
import { useI18n } from '../../store/langStore'

function ReadonlyFlowInner({
  project,
  showMinimap,
  onZoomChange,
  onReady,
}: {
  project: CanvasProject
  showMinimap: boolean
  onZoomChange: (zoom: number) => void
  onReady: (api: { fitView: () => void; setZoom: (pct: number) => void }) => void
}) {
  const { fitView, setViewport, getViewport } = useReactFlow()
  const readyRef = useRef(false)

  useEffect(() => {
    if (readyRef.current) return
    readyRef.current = true
    onReady({
      fitView: () => {
        fitView({ padding: 0.12, duration: 280 })
        window.setTimeout(() => onZoomChange(Math.round(getViewport().zoom * 100)), 300)
      },
      setZoom: (pct) => {
        const vp = getViewport()
        setViewport({ ...vp, zoom: pct / 100 })
        onZoomChange(pct)
      },
    })
  }, [fitView, getViewport, onReady, onZoomChange, setViewport])

  const onMoveEnd: OnMove = useCallback((_e, viewport) => {
    onZoomChange(Math.round(viewport.zoom * 100))
  }, [onZoomChange])

  return (
    <ReactFlow
      nodes={project.nodes}
      edges={project.edges}
      nodeTypes={nodeTypes}
      defaultViewport={project.viewport}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      zoomOnScroll
      minZoom={0.05}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      onMoveEnd={onMoveEnd}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
      {showMinimap && (
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              text: '#60a5fa', image: '#a78bfa', video: '#fbbf24', audio: '#34d399',
            }
            return colors[n.type ?? 'text'] ?? '#71717a'
          }}
          maskColor="rgba(9,9,11,0.85)"
          className="!bottom-20 !left-4"
        />
      )}
    </ReactFlow>
  )
}

interface ReadonlyWorkflowCanvasProps {
  project: CanvasProject
}

export function ReadonlyWorkflowCanvas({ project }: ReadonlyWorkflowCanvasProps) {
  const { t } = useI18n()
  const tips = t.canvas.tooltips
  const [showMinimap, setShowMinimap] = useState(true)
  const [zoom, setZoom] = useState(Math.round(project.viewport.zoom * 100))
  const [flowApi, setFlowApi] = useState<{ fitView: () => void; setZoom: (pct: number) => void } | null>(null)
  const handleReady = useCallback((api: { fitView: () => void; setZoom: (pct: number) => void }) => {
    setFlowApi(api)
  }, [])

  return (
    <div className="relative flex-1 overflow-hidden">
      <ReactFlowProvider>
        <ReadonlyFlowInner
          project={project}
          showMinimap={showMinimap}
          onZoomChange={setZoom}
          onReady={handleReady}
        />
      </ReactFlowProvider>

      <div className="workflow-preview-toolbar pointer-events-auto">
        <Tooltip label={showMinimap ? tips.minimapHide : tips.minimapShow}>
          <button
            type="button"
            onClick={() => setShowMinimap((v) => !v)}
            className={`canvas-bottom-icon ui-clickable ${showMinimap ? 'canvas-bottom-icon--active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" strokeLinejoin="round" />
              <path d="M8 2v16M16 6v16" strokeLinejoin="round" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip label={tips.fitView}>
          <button type="button" onClick={() => flowApi?.fitView()} className="canvas-bottom-icon ui-clickable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip label={tips.zoom}>
          <div className="canvas-zoom-slider">
            <input
              type="range"
              min={10}
              max={200}
              value={zoom}
              onChange={(e) => flowApi?.setZoom(Number(e.target.value))}
              className="canvas-zoom-input"
              aria-label={tips.zoom}
            />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
