/** ReactFlow 画布：节点交互、viewport 同步、Delete 删节点 */
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
  type OnMove,
} from '@xyflow/react'
import { useCanvasStore } from '../store/canvasStore'
import { nodeTypes } from './nodes'

function PaneInteractionHandlers({
  containerRef,
  onPaneDoubleClick,
  onPaneContextMenu,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  onPaneDoubleClick?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
  onPaneContextMenu?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
}) {
  const { screenToFlowPosition } = useReactFlow()

  useEffect(() => {
    const pane = containerRef.current?.querySelector('.react-flow__pane')
    if (!pane) return

    const onDblClick = (event: Event) => {
      if (!onPaneDoubleClick) return
      const e = event as MouseEvent
      e.preventDefault()
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      onPaneDoubleClick(e, flowPosition)
    }

    const onContextMenu = (event: Event) => {
      if (!onPaneContextMenu) return
      const e = event as MouseEvent
      e.preventDefault()
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      onPaneContextMenu(e, flowPosition)
    }

    if (onPaneDoubleClick) pane.addEventListener('dblclick', onDblClick)
    if (onPaneContextMenu) pane.addEventListener('contextmenu', onContextMenu)

    return () => {
      if (onPaneDoubleClick) pane.removeEventListener('dblclick', onDblClick)
      if (onPaneContextMenu) pane.removeEventListener('contextmenu', onContextMenu)
    }
  }, [containerRef, onPaneDoubleClick, onPaneContextMenu, screenToFlowPosition])

  return null
}

export function FlowCanvas({
  hideChrome = false,
  showMinimap = false,
  onPaneDoubleClick,
  onPaneContextMenu,
}: {
  hideChrome?: boolean
  showMinimap?: boolean
  onPaneDoubleClick?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
  onPaneContextMenu?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
}) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const project = useCanvasStore((s) => s.project)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const setViewport = useCanvasStore((s) => s.setViewport)

  const flowNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId })),
    [nodes, selectedNodeId],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => selectNode(node.id),
    [selectNode],
  )

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])

  const onMoveEnd: OnMove = useCallback(
    (_event, viewport) => setViewport(viewport),
    [setViewport],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        deleteSelected()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deleteSelected])

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative flex-1 bg-[var(--tn-bg)]">
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        defaultViewport={project.viewport}
        fitView={nodes.length === 0}
        minZoom={0.1}
        maxZoom={2}
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        {(onPaneDoubleClick || onPaneContextMenu) && (
          <PaneInteractionHandlers
            containerRef={containerRef}
            onPaneDoubleClick={onPaneDoubleClick}
            onPaneContextMenu={onPaneContextMenu}
          />
        )}
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#ffffff4d" />
        {!hideChrome && <Controls showInteractive={false} position="bottom-left" />}
        {showMinimap && (
          <MiniMap
            nodeColor={(n) => {
              const colors: Record<string, string> = {
                text: '#60a5fa', image: '#a78bfa', video: '#fbbf24', audio: '#34d399',
              }
              return colors[n.type ?? 'text'] ?? '#71717a'
            }}
            maskColor="rgba(9,9,11,0.85)"
            className="canvas-minimap !bottom-[68px] !left-4 !right-auto"
          />
        )}
      </ReactFlow>
    </div>
  )
}
