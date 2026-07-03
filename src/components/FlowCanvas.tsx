/** ReactFlow 画布：节点交互、viewport 同步、Delete 删节点 */
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

export function FlowCanvas({
  hideChrome = false,
  showMinimap = false,
  hasRightPanel = false,
}: {
  hideChrome?: boolean
  showMinimap?: boolean
  hasRightPanel?: boolean
}) {
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

  // Delete/Backspace 删除选中节点；输入框内编辑时不拦截
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
            className={hasRightPanel ? '!bottom-3 !right-[calc(var(--tn-panel-w)+12px)]' : '!bottom-3 !right-3'}
          />
        )}
      </ReactFlow>
    </div>
  )
}
