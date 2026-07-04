/** 画布页：按路由/location.state 加载或新建项目，空画布快捷操作 */
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasTopBar } from '../components/shell/CanvasTopBar'
import { CanvasToolbar } from '../components/shell/CanvasToolbar'
import { CanvasContextMenu, type CanvasAddAction } from '../components/shell/CanvasContextMenu'
import { FlowCanvas } from '../components/FlowCanvas'
import { CanvasAgentPanel } from '../components/canvas/CanvasAgentPanel'
import { CanvasQuickActions } from '../components/canvas/CanvasQuickActions'
import { CanvasBottomBar } from '../components/canvas/CanvasBottomBar'
import { useCanvasStore } from '../store/canvasStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import type { CanvasProject } from '../types'
import type { NodeType } from '../types'
import { mockGetTapTVWorkflow } from '../mock/api'
import { nodePositionAtCursor } from '../utils/canvasLayout'
import { AI_MODEL_OPTIONS } from '../config/agentModels'
import { useI18n } from '../store/langStore'

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
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)

  const wsInit = useWorkspaceStore((s) => s.init)
  const getProject = useWorkspaceStore((s) => s.getProject)
  const updateProject = useWorkspaceStore((s) => s.updateProject)
  const createProject = useWorkspaceStore((s) => s.createProject)

  const [addMenu, setAddMenu] = useState<{
    x: number
    y: number
    flowPosition?: { x: number; y: number }
  } | null>(null)
  const [showAgentPanel, setShowAgentPanel] = useState(false)
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string | undefined>()
  const [agentModelId, setAgentModelId] = useState(AI_MODEL_OPTIONS[0].id)
  const [agentAutoModel, setAgentAutoModel] = useState(true)
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)

  useEffect(() => { wsInit() }, [wsInit])

  /** 画布初始化：优先级 location.state > projectId > localStorage */
  useEffect(() => {
    const state = location.state as {
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

    const fromHomeAgent = !!(state?.openAgentPanel || state?.initialPrompt?.trim())

    if (state?.newProject && state.project) {
      // 从 Header 导入 JSON 等场景传入完整 project
      resetCanvas()
      loadProject(state.project)
      window.history.replaceState({}, '')
      return
    }

    if (state?.project) {
      // TapTV 克隆项目：加载完整 workflow 快照
      resetCanvas()
      loadProject(state.project)
      window.history.replaceState({}, '')
      return
    }

    if (state?.forkFrom) {
      resetCanvas()
      mockGetTapTVWorkflow(state.forkFrom).then((wf) => {
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
      const wp = getProject(projectId)
      if (wp) {
        resetCanvas()
        loadProject({
          id: wp.id,
          name: wp.name,
          createdAt: wp.createdAt,
          updatedAt: wp.updatedAt,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        })
        if (fromHomeAgent) {
          setShowAgentPanel(true)
          setAgentInitialPrompt(state?.initialPrompt?.trim() || undefined)
          if (state?.modelId) setAgentModelId(state.modelId)
          if (state?.autoModel !== undefined) setAgentAutoModel(state.autoModel)
        }
      } else {
        navigate('/home/projects')
      }
      window.history.replaceState({}, '')
      return
    }

    if (state?.initialPrompt?.trim() || state?.openAgentPanel) {
      setShowAgentPanel(true)
      setAgentInitialPrompt(state?.initialPrompt?.trim() || undefined)
      if (state?.modelId) setAgentModelId(state.modelId)
      if (state?.autoModel !== undefined) setAgentAutoModel(state.autoModel)
      resetCanvas()
      window.history.replaceState({}, '')
      return
    }

    init()
  }, [projectId, init, resetCanvas, loadProject, applyStoryboard, navigate, location.state, getProject])

  const handleNameChange = useCallback((name: string) => {
    setProjectName(name)
    if (projectId) updateProject(projectId, { name, updatedAt: new Date().toISOString() })
  }, [setProjectName, updateProject, projectId])

  const handleNewProject = useCallback(() => {
    const wp = projectId ? getProject(projectId) : null
    const folderId = wp?.folderId ?? (location.state as { folderId?: string | null } | null)?.folderId ?? null
    const proj = createProject(folderId)
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true } })
  }, [projectId, getProject, createProject, navigate, location.state])

  const handleAddNode = useCallback((type: NodeType | 'group', position?: { x: number; y: number }) => {
    addNode(type, position)
  }, [addNode])

  const openAddMenu = useCallback((x: number, y: number, flowPosition?: { x: number; y: number }) => {
    setAddMenu({ x, y, flowPosition })
  }, [])

  const handleAddFromMenu = useCallback((type: CanvasAddAction) => {
    if (type === 'playlist' || type === 'world3d' || type === 'upload') return
    if (addMenu?.flowPosition) {
      handleAddNode(type, nodePositionAtCursor(addMenu.flowPosition))
    } else {
      handleAddNode(type)
    }
    setAddMenu(null)
  }, [addMenu, handleAddNode])

  const handlePaneDoubleClick = useCallback((e: MouseEvent, flowPosition: { x: number; y: number }) => {
    openAddMenu(e.clientX, e.clientY, flowPosition)
  }, [openAddMenu])

  const handlePaneContextMenu = useCallback((e: MouseEvent, flowPosition: { x: number; y: number }) => {
    openAddMenu(e.clientX, e.clientY, flowPosition)
  }, [openAddMenu])

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
      <div className="canvas-page relative flex h-full flex-col bg-[#050505]">
        <CanvasTopBar
          projectName={project.name}
          onProjectNameChange={handleNameChange}
          projectId={projectId}
          updatedAt={project.updatedAt}
          onNewProject={handleNewProject}
          onDelete={() => navigate('/home/projects')}
        />
        <div className="relative flex flex-1 overflow-hidden">
          <div className="relative flex flex-1">
            <FlowCanvas
              hideChrome={isEmpty}
              showMinimap={showMinimap}
              onPaneDoubleClick={handlePaneDoubleClick}
              onPaneContextMenu={handlePaneContextMenu}
            />
            <CanvasToolbar onAddNode={handleAddNode} onOpenAddMenu={handleOpenAddMenuFromToolbar} />
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
              zoom={project.viewport.zoom}
              onZoomChange={(zoom) => setViewport({ ...project.viewport, zoom })}
              showMinimap={showMinimap}
              onToggleMinimap={() => setShowMinimap((v) => !v)}
            />
          </div>
          {showAgentPanel && (
            <CanvasAgentPanel
              initialPrompt={agentInitialPrompt}
              modelId={agentModelId}
              autoModel={agentAutoModel}
              onModelChange={setAgentModelId}
              onAutoModelChange={setAgentAutoModel}
              onClose={() => setShowAgentPanel(false)}
            />
          )}
        </div>

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
      </div>
    </ReactFlowProvider>
  )
}
