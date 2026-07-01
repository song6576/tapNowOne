import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { CanvasTopBar } from '../components/shell/CanvasTopBar'
import { CanvasToolbar } from '../components/shell/CanvasToolbar'
import { TaskBar } from '../components/shell/TaskBar'
import { CanvasContextMenu } from '../components/shell/CanvasContextMenu'
import { FlowCanvas } from '../components/FlowCanvas'
import { RightPanel } from '../components/RightPanel'
import { useCanvasStore } from '../store/canvasStore'
import { MOCK_TASKS, MOCK_PROJECTS } from '../mock/data'
import type { CanvasProject } from '../types'
import type { NodeType } from '../types'
import type { GenerationTask } from '../mock/data'

export function CanvasPage() {
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const project = useCanvasStore((s) => s.project)
  const setProjectName = useCanvasStore((s) => s.setProjectName)
  const init = useCanvasStore((s) => s.init)
  const resetCanvas = useCanvasStore((s) => s.resetCanvas)
  const loadProject = useCanvasStore((s) => s.loadProject)
  const addNode = useCanvasStore((s) => s.addNode)
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)
  const selectNode = useCanvasStore((s) => s.selectNode)

  const [tasks] = useState<GenerationTask[]>(MOCK_TASKS)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const state = location.state as { newProject?: boolean; project?: CanvasProject; forkFrom?: string } | null

    if (state?.newProject && state.project) {
      resetCanvas()
      loadProject(state.project)
      window.history.replaceState({}, '')
      return
    }

    if (state?.forkFrom) {
      resetCanvas()
      applyStoryboard(
        [
          { label: '分镜 1', prompt: 'Forked scene A' },
          { label: '分镜 2', prompt: 'Forked scene B' },
          { label: '分镜 3', prompt: 'Forked scene C' },
        ],
        'Forked from TapTV',
      )
      window.history.replaceState({}, '')
      return
    }

    if (projectId) {
      const mock = MOCK_PROJECTS.find((p) => p.id === projectId)
      if (mock) {
        resetCanvas()
        loadProject({
          id: mock.id,
          name: mock.name,
          createdAt: mock.updatedAt,
          updatedAt: mock.updatedAt,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        })
      } else {
        navigate('/home/projects')
      }
      return
    }

    init()
  }, [projectId, init, resetCanvas, loadProject, applyStoryboard, navigate, location.state])

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

  const handleTaskClick = useCallback((task: GenerationTask) => {
    if (task.nodeId) selectNode(task.nodeId)
  }, [selectNode])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col bg-[var(--tn-bg)]">
        <CanvasTopBar
          projectName={project.name}
          onProjectNameChange={setProjectName}
          projectId={projectId}
        />
        <div className="flex flex-1 overflow-hidden" onContextMenu={handleContextMenu}>
          <CanvasToolbar onAddNode={handleAddNode} onLoadDemo={handleLoadDemo} />
          <FlowCanvas />
          <RightPanel />
        </div>
        <TaskBar tasks={tasks} onTaskClick={handleTaskClick} />

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
