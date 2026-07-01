import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeMouseHandler,
  type OnMove,
} from '@xyflow/react'
import { useCanvasStore } from '../store/canvasStore'
import { nodeTypes } from './nodes'

export function FlowCanvas() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const project = useCanvasStore((s) => s.project)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const setViewport = useCanvasStore((s) => s.setViewport)

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

  return (
    <div className="relative flex-1 bg-[var(--tn-bg)]">
      <ReactFlow
        nodes={nodes}
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
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              text: '#60a5fa', image: '#a78bfa', video: '#fbbf24', audio: '#34d399',
            }
            return colors[n.type ?? 'text'] ?? '#71717a'
          }}
          maskColor="rgba(9,9,11,0.85)"
          className="!bottom-3 !right-[calc(var(--tn-panel-w)+12px)]"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--tn-text-muted)]">Empty Canvas</p>
            <p className="mt-2 text-xs text-zinc-600">
              Right-click to add nodes · or use left toolbar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
