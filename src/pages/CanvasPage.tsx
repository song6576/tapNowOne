/** 画布页：按路由/location.state 加载或新建项目，空画布快捷操作 */
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasTopBar } from '../components/shell/CanvasTopBar'
import { CanvasToolbar } from '../components/shell/CanvasToolbar'
import { TaskBar } from '../components/shell/TaskBar'
import { CanvasContextMenu } from '../components/shell/CanvasContextMenu'
import { FlowCanvas } from '../components/FlowCanvas'
import { RightPanel } from '../components/RightPanel'
import { CanvasQuickActions } from '../components/canvas/CanvasQuickActions'
import { CanvasBottomBar } from '../components/canvas/CanvasBottomBar'
import { useCanvasStore } from '../store/canvasStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import { MOCK_TASKS } from '../mock/data'
import type { CanvasProject } from '../types'
import { mockGetTapTVWorkflow } from '../mock/api'
import type { NodeType } from '../types'
import type { GenerationTask } from '../mock/data'
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
  const selectNode = useCanvasStore((s) => s.selectNode)

  const wsInit = useWorkspaceStore((s) => s.init)
  const getProject = useWorkspaceStore((s) => s.getProject)
  const updateProject = useWorkspaceStore((s) => s.updateProject)
  const createProject = useWorkspaceStore((s) => s.createProject)

  const [tasks] = useState<GenerationTask[]>(MOCK_TASKS)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)

  useEffect(() => { wsInit() }, [wsInit])

  /** 画布初始化：优先级 location.state > projectId > localStorage */
  useEffect(() => {
    const state = location.state as {
      newProject?: boolean
      project?: CanvasProject
      forkFrom?: string
      initialPrompt?: string
      folderId?: string | null
      isNew?: boolean
    } | null

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
      // 工作空间项目：从 workspaceStore 取元数据，画布内容暂为空（后续可接云端 load）
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
      } else {
        navigate('/home/projects')
      }
      return
    }

    if (state?.initialPrompt?.trim()) {
      // 首页 Hero 提交：用 prompt 生成分镜 text 节点
      resetCanvas()
      applyStoryboard(
        [{ label: 'Prompt', prompt: state.initialPrompt.trim() }],
        state.initialPrompt.trim(),
      )
      window.history.replaceState({}, '')
      return
    }

    init()
  }, [projectId, init, resetCanvas, loadProject, applyStoryboard, navigate, location.state, getProject])

  const handleNameChange = useCallback((name: string) => {
    setProjectName(name)
    if (projectId) updateProject(projectId, { name })
  }, [setProjectName, updateProject, projectId])

  const handleNewProject = useCallback(() => {
    const wp = projectId ? getProject(projectId) : null
    const folderId = wp?.folderId ?? (location.state as { folderId?: string | null } | null)?.folderId ?? null
    const proj = createProject(folderId)
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true } })
  }, [projectId, getProject, createProject, navigate, location.state])

  const handleAddNode = useCallback((type: NodeType | 'group') => {
    addNode(type)
  }, [addNode])

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

  const handleTaskClick = useCallback((task: GenerationTask) => {
    if (task.nodeId) selectNode(task.nodeId)
  }, [selectNode])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const isEmpty = nodes.length === 0

  useEffect(() => {
    setShowMinimap(!isEmpty)
  }, [isEmpty])

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
        <div className="relative flex flex-1 overflow-hidden" onContextMenu={handleContextMenu}>
          <div className="relative flex flex-1">
            <FlowCanvas hideChrome={isEmpty} showMinimap={showMinimap} hasRightPanel={!isEmpty} />
            <CanvasToolbar onAddNode={handleAddNode} />
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
          {!isEmpty && <RightPanel />}
        </div>
        {!isEmpty && <TaskBar tasks={tasks} onTaskClick={handleTaskClick} />}

        {!promoDismissed && isEmpty && (
          <div className="canvas-promo-banner">
            <span>{t.canvas.promoBanner}</span>
            <button type="button" onClick={() => setPromoDismissed(true)} className="ui-clickable text-white/50 hover:text-white">
              ×
            </button>
          </div>
        )}

        {contextMenu && (
          <CanvasContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAdd={handleAddNode}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}
