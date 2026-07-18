/** 画布页：按路由/location.state 加载或新建项目，空画布快捷操作 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasTopBar } from '../components/shell/CanvasTopBar'
import { CanvasToolbar } from '../components/shell/CanvasToolbar'
import { CanvasContextMenu, type CanvasAddAction } from '../components/shell/CanvasContextMenu'
import { NodeContextMenu, type NodeContextAction } from '../components/shell/NodeContextMenu'
import { FlowCanvas, type ConnectDropPayload } from '../components/FlowCanvas'
import { CanvasAgentPanel } from '../components/canvas/CanvasAgentPanel'
import { CanvasQuickActions } from '../components/canvas/CanvasQuickActions'
import { CanvasBottomBar } from '../components/canvas/CanvasBottomBar'
import { useCanvasStore } from '../store/canvasStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import type { CanvasProject } from '../types'
import type { NodeType } from '../types'
import { getTapTVWorkflow } from '../services/api'
import { getProject as fetchCloudProject, uploadProjectAsset } from '../api/client'
import { getToken } from '../utils/auth'
import { useToastStore } from '../store/toastStore'
import { nodePositionAtCursor } from '../utils/canvasLayout'
import { DEFAULT_AGENT_MODEL } from '../types/aiModel'
import { useI18n } from '../store/langStore'

type CanvasNavState = {
  newProject?: boolean
  project?: CanvasProject
  forkFrom?: string
  initialPrompt?: string
  openAgentPanel?: boolean
  modelId?: string
  autoModel?: boolean
  folderId?: string | null
  isNew?: boolean
} | null

function readAgentNav(state: CanvasNavState) {
  return {
    open: !!(
      state?.openAgentPanel ||
      state?.initialPrompt?.trim() ||
      state?.isNew ||
      state?.newProject
    ),
    prompt: state?.initialPrompt?.trim() || undefined,
    modelId: state?.modelId ?? DEFAULT_AGENT_MODEL,
    autoModel: state?.autoModel ?? true,
  }
}

export function CanvasPage() {
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  const project = useCanvasStore((s) => s.project)
  const nodes = useCanvasStore((s) => s.nodes)
  const setProjectName = useCanvasStore((s) => s.setProjectName)
  const setViewport = useCanvasStore((s) => s.setViewport)
  const init = useCanvasStore((s) => s.init)
  const resetCanvas = useCanvasStore((s) => s.resetCanvas)
  const loadProject = useCanvasStore((s) => s.loadProject)
  const addNode = useCanvasStore((s) => s.addNode)
  const connectNodes = useCanvasStore((s) => s.connectNodes)
  const addUploadedAsset = useCanvasStore((s) => s.addUploadedAsset)
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)
  const copySelected = useCanvasStore((s) => s.copySelected)
  const pasteClipboard = useCanvasStore((s) => s.pasteClipboard)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const hasClipboard = useCanvasStore((s) => s.hasClipboard)

  const wsInit = useWorkspaceStore((s) => s.init)
  const getProject = useWorkspaceStore((s) => s.getProject)
  const updateProject = useWorkspaceStore((s) => s.updateProject)
  const createProject = useWorkspaceStore((s) => s.createProject)

  const [addMenu, setAddMenu] = useState<{
    x: number
    y: number
    flowPosition?: { x: number; y: number }
    /** 从节点手柄拉线松手后，选类型并自动连线 */
    connectFrom?: ConnectDropPayload
  } | null>(null)

  const [nodeMenu, setNodeMenu] = useState<{
    x: number
    y: number
    flowPosition: { x: number; y: number }
    canPaste: boolean
    canDownload: boolean
    downloadUrl?: string
    downloadName?: string
  } | null>(null)

  // 首页跳转参数必须在首屏同步读取，不能等 useEffect（replaceState 后会丢失）
  const navStateRef = useRef(location.state as CanvasNavState)
  const agentNavRef = useRef(readAgentNav(navStateRef.current))
  const canvasBootstrappedRef = useRef(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const uploadPositionRef = useRef<{ x: number; y: number } | undefined>(undefined)
  const uploadConnectFromRef = useRef<ConnectDropPayload | undefined>(undefined)
  const showToast = useToastStore((s) => s.showToast)

  const [showAgentPanel, setShowAgentPanel] = useState(agentNavRef.current.open)
  /** 收起后仍挂载面板以保留对话；并显示画布浮动入口 */
  const [agentCollapsed, setAgentCollapsed] = useState(false)
  const [agentInitialPrompt, setAgentInitialPrompt] = useState(agentNavRef.current.prompt)
  const [agentModelId, setAgentModelId] = useState(agentNavRef.current.modelId)
  const [agentAutoModel, setAgentAutoModel] = useState(agentNavRef.current.autoModel)
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)

  const openAgentPanel = useCallback(() => {
    setShowAgentPanel(true)
    setAgentCollapsed(false)
  }, [])

  const collapseAgentPanel = useCallback(() => {
    setShowAgentPanel(false)
    setAgentCollapsed(true)
    setAgentInitialPrompt(undefined)
  }, [])

  useEffect(() => { wsInit() }, [wsInit])

  /** 画布初始化：仅执行一次，避免 replaceState 清空 state 后重复 resetCanvas */
  useEffect(() => {
    if (canvasBootstrappedRef.current) return
    canvasBootstrappedRef.current = true

    const state = navStateRef.current

    if (state?.newProject && state.project) {
      resetCanvas()
      loadProject(state.project)
      window.history.replaceState({}, '')
      return
    }

    if (state?.project) {
      resetCanvas()
      loadProject(state.project)
      window.history.replaceState({}, '')
      return
    }

    if (state?.forkFrom) {
      resetCanvas()
      getTapTVWorkflow(state.forkFrom).then((wf) => {
        if (wf) {
          loadProject({
            ...wf,
            id: `fork-${Date.now()}`,
            name: wf.name,
            updatedAt: new Date().toISOString(),
          })
        } else {
          applyStoryboard(
            [
              { label: '分镜 1', prompt: 'Forked scene A' },
              { label: '分镜 2', prompt: 'Forked scene B' },
              { label: '分镜 3', prompt: 'Forked scene C' },
            ],
            'Forked from TapTV',
          )
        }
      })
      window.history.replaceState({}, '')
      return
    }

    if (projectId) {
      resetCanvas()
      window.history.replaceState({}, '')

      if (getToken()) {
        fetchCloudProject(projectId)
          .then((row) => {
            loadProject({
              ...row.data,
              id: row.id,
              name: row.name,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            })
          })
          .catch(() => navigate('/home/projects'))
        return
      }

      const wp = getProject(projectId)
      if (wp) {
        loadProject({
          id: wp.id,
          name: wp.name,
          createdAt: wp.createdAt,
          updatedAt: wp.updatedAt,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        })
      } else {
        navigate('/home/projects')
      }
      return
    }

    if (state?.initialPrompt?.trim() || state?.openAgentPanel) {
      resetCanvas()
      window.history.replaceState({}, '')
      return
    }

    init()
  }, [projectId, init, resetCanvas, loadProject, applyStoryboard, navigate, getProject])

  const handleNameChange = useCallback((name: string) => {
    setProjectName(name)
    if (projectId) void updateProject(projectId, { name, updatedAt: new Date().toISOString() })
  }, [setProjectName, updateProject, projectId])

  const handleNewProject = useCallback(async () => {
    const wp = projectId ? getProject(projectId) : null
    const folderId = wp?.folderId ?? (location.state as { folderId?: string | null } | null)?.folderId ?? null
    const proj = await createProject(folderId)
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true, openAgentPanel: true } })
  }, [projectId, getProject, createProject, navigate, location.state])

  const handleAddNode = useCallback((type: NodeType | 'group', position?: { x: number; y: number }) => {
    return addNode(type, position)
  }, [addNode])

  const openAddMenu = useCallback((
    x: number,
    y: number,
    flowPosition?: { x: number; y: number },
    connectFrom?: ConnectDropPayload,
  ) => {
    setNodeMenu(null)
    setAddMenu({ x, y, flowPosition, connectFrom })
  }, [])

  const handleAddFromMenu = useCallback((type: CanvasAddAction) => {
    if (type === 'upload') {
      uploadPositionRef.current = addMenu?.flowPosition
      uploadConnectFromRef.current = addMenu?.connectFrom
      setAddMenu(null)
      if (!getToken()) {
        navigate('/login')
        return
      }
      uploadInputRef.current?.click()
      return
    }
    if (type === 'playlist' || type === 'world3d') return

    const position = addMenu?.flowPosition
      ? nodePositionAtCursor(addMenu.flowPosition)
      : undefined
    const newId = handleAddNode(type, position)
    const from = addMenu?.connectFrom
    if (from && newId) {
      if (from.handleType === 'target') {
        // 从输入点拉出：新节点 → 原节点
        connectNodes(newId, from.nodeId, null, from.handleId)
      } else {
        // 从输出点拉出：原节点 → 新节点
        connectNodes(from.nodeId, newId, from.handleId, null)
      }
    }
    setAddMenu(null)
  }, [addMenu, handleAddNode, connectNodes, navigate])

  const handleConnectDrop = useCallback((
    clientX: number,
    clientY: number,
    flowPosition: { x: number; y: number },
    from: ConnectDropPayload,
  ) => {
    openAddMenu(clientX, clientY, flowPosition, from)
  }, [openAddMenu])

  const handleUploadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const connectFrom = uploadConnectFromRef.current
    try {
      const result = await uploadProjectAsset(file, projectId)
      const newId = addUploadedAsset(
        result.url,
        result.mime_type,
        result.filename,
        uploadPositionRef.current
          ? nodePositionAtCursor(uploadPositionRef.current)
          : undefined,
      )
      if (connectFrom && newId) {
        if (connectFrom.handleType === 'target') {
          connectNodes(newId, connectFrom.nodeId, null, connectFrom.handleId)
        } else {
          connectNodes(connectFrom.nodeId, newId, connectFrom.handleId, null)
        }
      }
      showToast({ type: 'success', message: '资源已上传' })
    } catch (err) {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : '上传失败',
      })
    } finally {
      uploadPositionRef.current = undefined
      uploadConnectFromRef.current = undefined
    }
  }, [projectId, addUploadedAsset, connectNodes, showToast])

  const handlePaneDoubleClick = useCallback((e: MouseEvent, flowPosition: { x: number; y: number }) => {
    openAddMenu(e.clientX, e.clientY, flowPosition)
  }, [openAddMenu])

  const handlePaneContextMenu = useCallback((e: MouseEvent, flowPosition: { x: number; y: number }) => {
    setNodeMenu(null)
    openAddMenu(e.clientX, e.clientY, flowPosition)
  }, [openAddMenu])

  const handleNodeContextMenu = useCallback((
    e: MouseEvent,
    nodeId: string,
    flowPosition: { x: number; y: number },
  ) => {
    setAddMenu(null)
    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId)
    const url = node?.data.outputUrl
    const canDownload = Boolean(
      url && (node?.type === 'image' || node?.type === 'video' || node?.type === 'audio'),
    )
    setNodeMenu({
      x: e.clientX,
      y: e.clientY,
      flowPosition,
      canPaste: hasClipboard(),
      canDownload,
      downloadUrl: canDownload ? url : undefined,
      downloadName: node?.data.label || node?.type || 'download',
    })
  }, [hasClipboard])

  const handleNodeMenuAction = useCallback(async (action: NodeContextAction) => {
    if (action === 'copy') {
      copySelected()
      return
    }
    if (action === 'paste') {
      pasteClipboard(nodeMenu?.flowPosition)
      return
    }
    if (action === 'delete') {
      deleteSelected()
      return
    }
    if (action === 'download' && nodeMenu?.downloadUrl) {
      try {
        const res = await fetch(nodeMenu.downloadUrl)
        if (!res.ok) throw new Error('fetch failed')
        const blob = await res.blob()
        const ext =
          blob.type.includes('video') ? '.mp4'
            : blob.type.includes('audio') ? '.mp3'
              : blob.type.includes('png') ? '.png'
                : blob.type.includes('jpeg') || blob.type.includes('jpg') ? '.jpg'
                  : ''
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${nodeMenu.downloadName || 'download'}${ext}`
        a.click()
        URL.revokeObjectURL(a.href)
      } catch {
        window.open(nodeMenu.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }, [copySelected, pasteClipboard, deleteSelected, nodeMenu])

  const handleOpenAddMenuFromToolbar = useCallback(() => {
    const btn = document.querySelector('.canvas-float-add')
    if (btn) {
      const rect = btn.getBoundingClientRect()
      openAddMenu(rect.right + 10, rect.top)
    } else {
      openAddMenu(window.innerWidth / 2, window.innerHeight / 2)
    }
  }, [openAddMenu])

  const handleLoadDemo = useCallback(() => {
    applyStoryboard(
      [
        { label: '分镜 1', prompt: '清晨木桌上的咖啡，热气袅袅' },
        { label: '分镜 2', prompt: '阳光透过窗户洒在桌面' },
        { label: '分镜 3', prompt: '镜头推近咖啡杯特写' },
      ],
      '清晨，一杯咖啡在木桌上冒着热气。阳光透过窗户洒在桌面。镜头缓缓推近咖啡杯。',
    )
  }, [applyStoryboard])

  const handleQuickVideo = useCallback(() => addNode('video'), [addNode])
  const handleQuickImage = useCallback(() => addNode('image'), [addNode])
  const handleMixVideo = useCallback(() => {
    addNode('video')
    addNode('audio')
  }, [addNode])
  const handleLyrics = useCallback(() => addNode('text'), [addNode])

  const isEmpty = nodes.length === 0

  return (
    <ReactFlowProvider>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleUploadFile}
      />
      <div className="canvas-page relative flex h-full overflow-hidden bg-[#050505]">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CanvasTopBar
            projectName={project.name}
            onProjectNameChange={handleNameChange}
            projectId={projectId}
            updatedAt={project.updatedAt}
            onNewProject={handleNewProject}
            onDelete={() => navigate('/home/projects')}
          />
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <FlowCanvas
              hideChrome={isEmpty}
              showMinimap={showMinimap}
              onPaneDoubleClick={handlePaneDoubleClick}
              onPaneContextMenu={handlePaneContextMenu}
              onNodeContextMenu={handleNodeContextMenu}
              onConnectDrop={handleConnectDrop}
            />
            <CanvasToolbar
              onAddNode={handleAddNode}
              onOpenAddMenu={handleOpenAddMenuFromToolbar}
              onOpenAgent={openAgentPanel}
            />
            {isEmpty && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <CanvasQuickActions
                  onTextToVideo={handleQuickVideo}
                  onImageToVideo={handleQuickImage}
                  onSmartVideo={handleLoadDemo}
                  onMixVideo={handleMixVideo}
                  onLyrics={handleLyrics}
                />
              </div>
            )}
            <CanvasBottomBar
              showMinimap={showMinimap}
              onToggleMinimap={() => setShowMinimap((v) => !v)}
              onViewportPersist={setViewport}
            />
            {agentCollapsed && !showAgentPanel && (
              <button
                type="button"
                className="canvas-agent-fab ui-clickable"
                onClick={openAgentPanel}
                aria-label={t.canvas.agentPanel.openPanel}
                title={t.canvas.agentPanel.openPanel}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {(showAgentPanel || agentCollapsed) && (
          <div
            className="h-full min-h-0 shrink-0 self-stretch"
            style={{ display: showAgentPanel ? undefined : 'none' }}
            aria-hidden={!showAgentPanel}
          >
            <CanvasAgentPanel
              key={projectId ?? 'canvas-agent'}
              projectId={projectId}
              initialPrompt={agentInitialPrompt}
              modelId={agentModelId}
              autoModel={agentAutoModel}
              onModelChange={setAgentModelId}
              onAutoModelChange={setAgentAutoModel}
              onClose={collapseAgentPanel}
            />
          </div>
        )}

        {!promoDismissed && isEmpty && (
          <div className="canvas-promo-banner">
            <span>{t.canvas.promoBanner}</span>
            <button type="button" onClick={() => setPromoDismissed(true)} className="ui-clickable text-white/50 hover:text-white">
              ×
            </button>
          </div>
        )}

        {addMenu && (
          <CanvasContextMenu
            x={addMenu.x}
            y={addMenu.y}
            onAdd={handleAddFromMenu}
            onClose={() => setAddMenu(null)}
          />
        )}
        {nodeMenu && (
          <NodeContextMenu
            x={nodeMenu.x}
            y={nodeMenu.y}
            canPaste={nodeMenu.canPaste}
            canDownload={nodeMenu.canDownload}
            onAction={(action) => void handleNodeMenuAction(action)}
            onClose={() => setNodeMenu(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}
