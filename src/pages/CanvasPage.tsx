/** 画布页：按路由/location.state 加载或新建项目，空画布快捷操作 */
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { getProject as fetchCloudProject, uploadProjectAsset } from '../api/client'
import { getToken } from '../utils/auth'
import { useToastStore } from '../store/toastStore'
import { nodePositionAtCursor } from '../utils/canvasLayout'
import { AI_MODEL_OPTIONS } from '../config/agentModels'
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
    open: !!(state?.openAgentPanel || state?.initialPrompt?.trim()),
    prompt: state?.initialPrompt?.trim() || undefined,
    modelId: state?.modelId ?? AI_MODEL_OPTIONS[0].id,
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
  const addUploadedAsset = useCanvasStore((s) => s.addUploadedAsset)
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

  // 首页跳转参数必须在首屏同步读取，不能等 useEffect（replaceState 后会丢失）
  const navStateRef = useRef(location.state as CanvasNavState)
  const agentNavRef = useRef(readAgentNav(navStateRef.current))
  const canvasBootstrappedRef = useRef(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const uploadPositionRef = useRef<{ x: number; y: number } | undefined>(undefined)
  const showToast = useToastStore((s) => s.showToast)

  const [showAgentPanel, setShowAgentPanel] = useState(agentNavRef.current.open)
  const [agentInitialPrompt, setAgentInitialPrompt] = useState(agentNavRef.current.prompt)
  const [agentModelId, setAgentModelId] = useState(agentNavRef.current.modelId)
  const [agentAutoModel, setAgentAutoModel] = useState(agentNavRef.current.autoModel)
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)

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
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true } })
  }, [projectId, getProject, createProject, navigate, location.state])

  const handleAddNode = useCallback((type: NodeType | 'group', position?: { x: number; y: number }) => {
    addNode(type, position)
  }, [addNode])

  const openAddMenu = useCallback((x: number, y: number, flowPosition?: { x: number; y: number }) => {
    setAddMenu({ x, y, flowPosition })
  }, [])

  const handleAddFromMenu = useCallback((type: CanvasAddAction) => {
    if (type === 'upload') {
      uploadPositionRef.current = addMenu?.flowPosition
      setAddMenu(null)
      if (!getToken()) {
        navigate('/login')
        return
      }
      uploadInputRef.current?.click()
      return
    }
    if (type === 'playlist' || type === 'world3d') return
    if (addMenu?.flowPosition) {
      handleAddNode(type, nodePositionAtCursor(addMenu.flowPosition))
    } else {
      handleAddNode(type)
    }
    setAddMenu(null)
  }, [addMenu, handleAddNode, navigate])

  const handleUploadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const result = await uploadProjectAsset(file, projectId)
      addUploadedAsset(
        result.url,
        result.mime_type,
        result.filename,
        uploadPositionRef.current
          ? nodePositionAtCursor(uploadPositionRef.current)
          : undefined,
      )
      uploadPositionRef.current = undefined
      showToast({ type: 'success', message: '资源已上传' })
    } catch (err) {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : '上传失败',
      })
    }
  }, [projectId, addUploadedAsset, showToast])

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
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleUploadFile}
      />
      <div className="canvas-page relative flex h-full flex-col bg-[#050505]">
        <CanvasTopBar
          projectName={project.name}
          onProjectNameChange={handleNameChange}
          projectId={projectId}
          updatedAt={project.updatedAt}
          onNewProject={handleNewProject}
          onDelete={() => navigate('/home/projects')}
        />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <FlowCanvas
              hideChrome={isEmpty}
              showMinimap={showMinimap}
              onPaneDoubleClick={handlePaneDoubleClick}
              onPaneContextMenu={handlePaneContextMenu}
            />
            <CanvasToolbar
              onAddNode={handleAddNode}
              onOpenAddMenu={handleOpenAddMenuFromToolbar}
              onOpenAgent={() => setShowAgentPanel(true)}
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
              zoom={project.viewport.zoom}
              onZoomChange={(zoom) => setViewport({ ...project.viewport, zoom })}
              showMinimap={showMinimap}
              onToggleMinimap={() => setShowMinimap((v) => !v)}
            />
          </div>
          {showAgentPanel && (
            <CanvasAgentPanel
              key={projectId ?? 'canvas-agent'}
              projectId={projectId}
              initialPrompt={agentInitialPrompt}
              modelId={agentModelId}
              autoModel={agentAutoModel}
              onModelChange={setAgentModelId}
              onAutoModelChange={setAgentAutoModel}
              onClose={() => {
                setShowAgentPanel(false)
                setAgentInitialPrompt(undefined)
              }}
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
