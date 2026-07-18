/** ReactFlow 画布：节点交互、viewport 同步、拉线松手选节点、Delete 删节点 */
import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  SelectionMode,
  useReactFlow,
  type FinalConnectionState,
  type NodeMouseHandler,
  type OnConnectEnd,
  type OnMove,
} from '@xyflow/react'
import { useCanvasStore } from '../store/canvasStore'
import { nodeTypes } from './nodes'
import { CanvasSelectionToolbar } from './shell/CanvasSelectionToolbar'

export type ConnectDropPayload = {
  nodeId: string
  handleId?: string | null
  /** source=从输出点拉出；target=从输入点拉出 */
  handleType: 'source' | 'target'
}

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
  showMinimap = false,
  onPaneDoubleClick,
  onPaneContextMenu,
  onNodeContextMenu,
  onConnectDrop,
}: {
  hideChrome?: boolean
  showMinimap?: boolean
  onPaneDoubleClick?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
  onPaneContextMenu?: (event: MouseEvent, flowPosition: { x: number; y: number }) => void
  onNodeContextMenu?: (
    event: MouseEvent,
    nodeId: string,
    flowPosition: { x: number; y: number },
  ) => void
  /** 从节点手柄拉线后松在空白处：弹出选节点菜单 */
  onConnectDrop?: (
    clientX: number,
    clientY: number,
    flowPosition: { x: number; y: number },
    from: ConnectDropPayload,
  ) => void
}) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const project = useCanvasStore((s) => s.project)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const copySelected = useCanvasStore((s) => s.copySelected)
  const pasteClipboard = useCanvasStore((s) => s.pasteClipboard)
  const setViewport = useCanvasStore((s) => s.setViewport)
  const { screenToFlowPosition } = useReactFlow()

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      // ⌘/Ctrl/Shift 交给 React Flow 多选；普通点击单选
      if (event.metaKey || event.ctrlKey || event.shiftKey) return
      selectNode(node.id)
    },
    [selectNode],
  )

  const handleNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault()
      event.stopPropagation()
      selectNode(node.id)
      const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      onNodeContextMenu?.(event.nativeEvent, node.id, flowPosition)
    },
    [selectNode, onNodeContextMenu, screenToFlowPosition],
  )

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])

  const onMoveEnd: OnMove = useCallback(
    (_event, viewport) => setViewport(viewport),
    [setViewport],
  )

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState: FinalConnectionState) => {
      if (!onConnectDrop) return
      // 已接到别的节点，或没有起点 → 不弹菜单
      if (!connectionState.fromNode || connectionState.toNode) return

      const clientX =
        'changedTouches' in event
          ? event.changedTouches[0]?.clientX
          : (event as MouseEvent).clientX
      const clientY =
        'changedTouches' in event
          ? event.changedTouches[0]?.clientY
          : (event as MouseEvent).clientY
      if (clientX == null || clientY == null) return

      const target = (event.target as Element | null)?.closest?.(
        '.react-flow__node, .react-flow__handle, .canvas-add-menu, .canvas-bottom-bar, .canvas-float-toolbar',
      )
      // 松在节点/手柄/已有 UI 上时不弹（避免误触）
      if (target?.classList.contains('react-flow__handle')) return
      if (target?.classList.contains('react-flow__node')) return

      const handleType = connectionState.fromHandle?.type === 'target' ? 'target' : 'source'
      const flowPosition = screenToFlowPosition({ x: clientX, y: clientY })
      onConnectDrop(clientX, clientY, flowPosition, {
        nodeId: connectionState.fromNode.id,
        handleId: connectionState.fromHandle?.id ?? null,
        handleType,
      })
    },
    [onConnectDrop, screenToFlowPosition],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'c') {
        if (copySelected()) e.preventDefault()
        return
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (pasteClipboard()) e.preventDefault()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deleteSelected, copySelected, pasteClipboard])

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative flex-1 bg-[var(--tn-bg)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={handleConnectEnd}
        onNodeClick={onNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: 'rgba(255, 255, 255, 0.35)', strokeWidth: 1.5 },
        }}
        defaultViewport={project.viewport}
        fitView={nodes.length === 0}
        minZoom={0.1}
        maxZoom={2}
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        /** 左键空白处拖拽 = 框选；中键/右键拖拽 = 平移；滚轮/触控板 = 平移 */
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnDrag={[1, 2]}
        panOnScroll
        panActivationKeyCode="Space"
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
        <CanvasSelectionToolbar />
        {showMinimap && (
          <MiniMap
            pannable
            zoomable
            nodeColor="#7d8290"
            nodeStrokeColor="#9aa0ad"
            nodeStrokeWidth={1}
            nodeBorderRadius={4}
            bgColor="#121214"
            maskColor="rgba(0, 0, 0, 0.62)"
            maskStrokeColor="rgba(255, 255, 255, 0.28)"
            maskStrokeWidth={1.2}
            className="canvas-minimap !bottom-[68px] !left-4 !right-auto"
          />
        )}
      </ReactFlow>
    </div>
  )
}
