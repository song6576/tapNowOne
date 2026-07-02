/** 画布核心状态：ReactFlow 节点/边、持久化、单节点生成、工作流、分镜、导出 */
import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
} from '@xyflow/react'
import type { CanvasNode, CanvasEdge, CanvasProject, NodeType, NodeData } from '../types'
import { createDefaultNodeData } from '../types'
import { loadProject, saveProject, createEmptyProject } from '../utils/storage'
import { buildEffectivePrompt, getUpstreamInputs } from '../utils/upstream'
import { getWorkflowOrder } from '../utils/workflow'
import { generateNode as apiGenerate, composeVideo } from '../services/api'
import { collectComposeClips } from '../utils/compose'
import type { StoryboardScene } from '../api/client'

interface CanvasStore {
  project: CanvasProject
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedNodeId: string | null
  workflowRunning: boolean
  cloudId: string | null
  exporting: boolean

  init: () => void
  resetCanvas: () => void
  setProjectName: (name: string) => void
  setNodes: (nodes: CanvasNode[]) => void
  setEdges: (edges: CanvasEdge[]) => void
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: NodeType, position?: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  selectNode: (id: string | null) => void
  deleteSelected: () => void
  setViewport: (viewport: CanvasProject['viewport']) => void
  loadProject: (project: CanvasProject) => void
  persist: () => void
  schedulePersist: () => void
  getSelectedNode: () => CanvasNode | undefined
  generateNode: (nodeId: string) => Promise<boolean>
  runWorkflow: () => Promise<{ done: number; failed: number }>
  applyStoryboard: (scenes: StoryboardScene[], script: string) => number
  saveToCloud: () => Promise<void>
  loadCloudProject: (id: string) => Promise<void>
  exportVideo: () => Promise<string>
  getProjectPayload: () => CanvasProject
}

let nodeCounter = 0
/** 防抖写入 localStorage，避免拖拽节点时频繁 IO */
let persistTimer: ReturnType<typeof setTimeout> | null = null

function nextNodePosition(index = 0): { x: number; y: number } {
  nodeCounter += 1
  return { x: 200 + index * 280, y: 180 + (index % 2) * 120 }
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  project: createEmptyProject(),
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowRunning: false,
  cloudId: null,
  exporting: false,

  /** 从 localStorage 恢复上次编辑的画布（无 projectId 路由时使用） */
  init: () => {
    const saved = loadProject()
    if (saved) {
      set({
        project: saved,
        nodes: saved.nodes,
        edges: saved.edges,
      })
      nodeCounter = saved.nodes.length
    }
  },

  resetCanvas: () => {
    set({
      project: createEmptyProject(),
      nodes: [],
      edges: [],
      selectedNodeId: null,
      cloudId: null,
    })
    nodeCounter = 0
  },

  setProjectName: (name) => {
    set((s) => ({ project: { ...s.project, name } }))
    get().schedulePersist()
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) }))
    get().schedulePersist()
  },

  onEdgesChange: (changes) => {
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }))
    get().schedulePersist()
  },

  onConnect: (connection) => {
    if (connection.source === connection.target) return // 禁止自环
    set((s) => ({
      edges: addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}`,
          animated: true,
          style: { stroke: '#6366f1' },
        },
        s.edges,
      ),
    }))
    get().schedulePersist()
  },

  addNode: (type, position) => {
    const pos = position ?? nextNodePosition()
    const id = crypto.randomUUID()
    const newNode: CanvasNode =
      type === 'group'
        ? {
            id,
            type: 'group',
            position: pos,
            style: { width: 320, height: 240 },
            data: createDefaultNodeData(type),
            zIndex: -1,
          }
        : {
            id,
            type,
            position: pos,
            data: createDefaultNodeData(type),
          }
    set((s) => ({ nodes: [...s.nodes, newNode], selectedNodeId: id }))
    get().schedulePersist()
  },

  updateNodeData: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    }))
    get().schedulePersist()
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  deleteSelected: () => {
    const { selectedNodeId, nodes, edges } = get()
    if (!selectedNodeId) return
    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
      selectedNodeId: null,
    })
    get().persist()
  },

  setViewport: (viewport) => {
    set((s) => ({ project: { ...s.project, viewport } }))
    get().schedulePersist()
  },

  loadProject: (project) => {
    set({
      project,
      nodes: project.nodes,
      edges: project.edges,
      selectedNodeId: null,
      cloudId: project.id,
    })
    nodeCounter = project.nodes.length
    get().persist()
  },

  schedulePersist: () => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => get().persist(), 800) // 800ms 防抖
  },

  persist: () => {
    const { project, nodes, edges } = get()
    saveProject({ ...project, nodes, edges })
  },

  getSelectedNode: () => {
    const { selectedNodeId, nodes } = get()
    return nodes.find((n) => n.id === selectedNodeId)
  },

  /** 单节点 AI 生成：合并上游 prompt/图片，调用 services/api.generateNode */
  generateNode: async (nodeId) => {
    const { nodes, edges, updateNodeData } = get()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node?.type || node.type === 'text') return false

    const nodeType = node.type as 'image' | 'video' | 'audio'
    updateNodeData(nodeId, { status: 'generating', errorMessage: undefined })

    const { upstreamText, upstreamImageUrl } = getUpstreamInputs(nodeId, nodes, edges)
    const effectivePrompt = buildEffectivePrompt(node, nodes, edges)

    try {
      const resultUrl = await apiGenerate({
        node_type: nodeType,
        prompt: effectivePrompt,
        model: node.data.model,
        upstream_text: upstreamText,
        upstream_image_url: upstreamImageUrl,
        duration: node.data.duration ?? 4,
      })
      updateNodeData(nodeId, { status: 'done', outputUrl: resultUrl })
      return true
    } catch (err) {
      updateNodeData(nodeId, {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : '生成失败',
      })
      return false
    }
  },

  /** 按拓扑顺序批量生成；已 done 且有 outputUrl 的节点跳过 */
  runWorkflow: async () => {
    set({ workflowRunning: true })
    let done = 0
    let failed = 0
    try {
      const order = getWorkflowOrder(get().nodes, get().edges)
      for (const id of order) {
        const node = get().nodes.find((n) => n.id === id)
        if (node?.data.status === 'done' && node.data.outputUrl) {
          done += 1
          continue
        }
        const ok = await get().generateNode(id)
        if (ok) done += 1
        else failed += 1
      }
      return { done, failed }
    } finally {
      set({ workflowRunning: false })
    }
  },

  /** Agent 分镜：创建 1 个 text 节点 + N 个 image 节点，text → image 连线 */
  applyStoryboard: (scenes, script) => {
    const textId = crypto.randomUUID()
    const textNode: CanvasNode = {
      id: textId,
      type: 'text',
      position: { x: 80, y: 200 },
      data: {
        label: '脚本',
        prompt: script,
        outputText: script,
        status: 'done',
      },
    }

    const imageNodes: CanvasNode[] = scenes.map((scene, i) => ({
      id: crypto.randomUUID(),
      type: 'image' as const,
      position: nextNodePosition(i),
      data: {
        ...createDefaultNodeData('image'),
        label: scene.label,
        prompt: scene.prompt,
      },
    }))

    const newEdges: CanvasEdge[] = imageNodes.map((n) => ({
      id: `e-${textId}-${n.id}`,
      source: textId,
      target: n.id,
      animated: true,
      style: { stroke: '#6366f1' },
    }))

    set((s) => ({
      nodes: [...s.nodes, textNode, ...imageNodes],
      edges: [...s.edges, ...newEdges],
    }))
    get().persist()
    return imageNodes.length
  },

  getProjectPayload: () => {
    const { project, nodes, edges } = get()
    return { ...project, nodes, edges, updatedAt: new Date().toISOString() }
  },

  saveToCloud: async () => {
    get().persist()
    // Mock 模式：仅本地保存；后续接 backend saveProjectCloud
  },

  loadCloudProject: async (_id) => {
    get().init()
  },

  exportVideo: async () => {
    set({ exporting: true })
    try {
      const { nodes, edges } = get()
      const { clips, audioUrl } = collectComposeClips(nodes, edges)
      if (!clips.length) throw new Error('No clips to compose. Generate content first.')
      return await composeVideo(clips, audioUrl)
    } finally {
      set({ exporting: false })
    }
  },
}))
