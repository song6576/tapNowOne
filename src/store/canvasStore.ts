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
import { createDefaultNodeData, NODE_META } from '../types'
import { loadProject, saveProject, createEmptyProject } from '../utils/storage'
import { generateUUID } from '../utils/uuid'
import { buildEffectivePrompt, getUpstreamInputs } from '../utils/upstream'
import { generateNode as apiGenerate, composeVideo, agentChat } from '../services/api'
import { resolveAgentModel, resolveNodeModel } from '../config/agentModels'
import { getWorkflowOrder, buildCanvasContext } from '../utils/workflow'
import { patchProject, getProject as fetchCloudProject } from '../api/client'
import { getToken } from '../utils/auth'
import { collectComposeTimeline } from '../utils/compose'
import { nextToolbarNodePosition } from '../utils/canvasLayout'
import type { StoryboardScene } from '../api/client'

const TEXT_NODE_DEFAULT_WIDTH = 280
const TEXT_NODE_DEFAULT_HEIGHT = 180

function parseStyleSize(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

/** 确保 text 节点有固定宽高，便于四角等比缩放且长文案不撑开 */
function normalizeCanvasNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.map((node) => {
    if (node.type !== 'text') return node
    const width = parseStyleSize(node.style?.width, TEXT_NODE_DEFAULT_WIDTH)
    const height = parseStyleSize(node.style?.height, TEXT_NODE_DEFAULT_HEIGHT)
    return {
      ...node,
      style: { ...node.style, width, height },
    }
  })
}

/** 连接线统一为实线样式 */
function normalizeCanvasEdges(edges: CanvasEdge[]): CanvasEdge[] {
  return edges.map((edge) => ({
    ...edge,
    animated: false,
    style: {
      stroke: 'rgba(255, 255, 255, 0.35)',
      strokeWidth: 1.5,
      ...edge.style,
      strokeDasharray: undefined,
    },
  }))
}

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
  addNode: (type: NodeType, position?: { x: number; y: number }, dataPatch?: Partial<NodeData>) => string
  addUploadedAsset: (url: string, mimeType: string, filename: string, position?: { x: number; y: number }) => string
  /** 将上传结果填入已有空节点（不新建） */
  fillNodeWithAsset: (nodeId: string, url: string, filename: string) => void
  connectNodes: (
    source: string,
    target: string,
    sourceHandle?: string | null,
    targetHandle?: string | null,
  ) => void
  updateNodeData: (id: string, data: Partial<NodeData>) => void
  selectNode: (id: string | null) => void
  deleteSelected: () => void
  /** 节点右键菜单 / ⌘C：复制当前选中节点到内部剪贴板 */
  copySelected: () => boolean
  /** 节点右键菜单 / ⌘V：从剪贴板粘贴节点 */
  pasteClipboard: (position?: { x: number; y: number }) => boolean
  hasClipboard: () => boolean
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

/** 防抖写入 localStorage / 云端，避免拖拽节点时频繁 IO */
let persistTimer: ReturnType<typeof setTimeout> | null = null
let cloudPersistTimer: ReturnType<typeof setTimeout> | null = null

/** 画布内部剪贴板（不走系统剪贴板，避免敏感 URL 泄露） */
let nodeClipboard: CanvasNode | null = null

const PASTE_OFFSET = 40

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
        nodes: normalizeCanvasNodes(saved.nodes),
        edges: normalizeCanvasEdges(saved.edges),
      })
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
  },

  setProjectName: (name) => {
    const now = new Date().toISOString()
    set((s) => ({ project: { ...s.project, name, updatedAt: now } }))
    get().schedulePersist()
  },

  setNodes: (nodes) => set({ nodes: normalizeCanvasNodes(nodes) }),

  setEdges: (edges) => set({ edges: normalizeCanvasEdges(edges) }),

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
          animated: false,
          style: { stroke: 'rgba(255, 255, 255, 0.35)', strokeWidth: 1.5 },
        },
        s.edges,
      ),
    }))
    get().schedulePersist()
  },

  addNode: (type, position, dataPatch) => {
    const { nodes } = get()
    const pos = position ?? nextToolbarNodePosition(nodes.length)
    const id = generateUUID()
    const baseData = { ...createDefaultNodeData(type), ...dataPatch }
    const newNode: CanvasNode =
      type === 'group'
        ? {
            id,
            type: 'group',
            position: pos,
            style: { width: 320, height: 240 },
            data: baseData,
            zIndex: -1,
            selected: true,
          }
        : type === 'text'
          ? {
              id,
              type: 'text',
              position: pos,
              style: { width: TEXT_NODE_DEFAULT_WIDTH, height: TEXT_NODE_DEFAULT_HEIGHT },
              data: baseData,
              selected: true,
            }
          : {
              id,
              type,
              position: pos,
              data: baseData,
              selected: true,
            }
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), newNode],
      selectedNodeId: id,
    }))
    get().schedulePersist()
    return id
  },

  connectNodes: (source, target, sourceHandle, targetHandle) => {
    if (!source || !target || source === target) return
    get().onConnect({
      source,
      target,
      sourceHandle: sourceHandle ?? null,
      targetHandle: targetHandle ?? null,
    })
  },

  addUploadedAsset: (url, mimeType, filename, position) => {
    const nodeType: NodeType = mimeType.startsWith('video/')
      ? 'video'
      : mimeType.startsWith('audio/')
        ? 'audio'
        : 'image'
    const { nodes } = get()
    const pos = position ?? nextToolbarNodePosition(nodes.length)
    const id = generateUUID()
    const newNode: CanvasNode = {
      id,
      type: nodeType,
      position: pos,
      data: {
        ...createDefaultNodeData(nodeType),
        label: filename.replace(/\.[^.]+$/, '') || NODE_META[nodeType].label,
        status: 'done',
        outputUrl: url,
      },
      selected: true,
    }
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), newNode],
      selectedNodeId: id,
    }))
    get().schedulePersist()
    return id
  },

  fillNodeWithAsset: (nodeId, url, filename) => {
    const node = get().nodes.find((n) => n.id === nodeId)
    if (!node || (node.type !== 'image' && node.type !== 'video' && node.type !== 'audio')) return
    const label = filename.replace(/\.[^.]+$/, '') || node.data.label
    get().updateNodeData(nodeId, {
      label,
      status: 'done',
      outputUrl: url,
      errorMessage: undefined,
    })
    get().selectNode(nodeId)
  },

  updateNodeData: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    }))
    get().schedulePersist()
  },

  selectNode: (id) => {
    set((s) => ({
      selectedNodeId: id,
      nodes: s.nodes.map((n) => ({ ...n, selected: id !== null && n.id === id })),
    }))
  },

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

  copySelected: () => {
    const { selectedNodeId, nodes } = get()
    if (!selectedNodeId) return false
    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node) return false
    nodeClipboard = structuredClone(node)
    return true
  },

  hasClipboard: () => nodeClipboard !== null,

  pasteClipboard: (position) => {
    if (!nodeClipboard) return false
    const source = nodeClipboard
    const id = generateUUID()
    const pos = position ?? {
      x: source.position.x + PASTE_OFFSET,
      y: source.position.y + PASTE_OFFSET,
    }
    const newNode: CanvasNode = {
      ...structuredClone(source),
      id,
      position: pos,
      selected: true,
      dragging: false,
    }
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), newNode],
      selectedNodeId: id,
    }))
    // 连续粘贴时下次落点继续错开
    nodeClipboard = {
      ...nodeClipboard,
      position: { x: pos.x, y: pos.y },
    }
    get().schedulePersist()
    return true
  },

  setViewport: (viewport) => {
    set((s) => ({ project: { ...s.project, viewport } }))
    get().schedulePersist()
  },

  loadProject: (project) => {
    set({
      project,
      nodes: normalizeCanvasNodes(project.nodes),
      edges: normalizeCanvasEdges(project.edges),
      selectedNodeId: null,
      cloudId: project.id,
    })
    get().persist()
  },

  schedulePersist: () => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => get().persist(), 800)
    if (cloudPersistTimer) clearTimeout(cloudPersistTimer)
    cloudPersistTimer = setTimeout(() => void get().saveToCloud(), 800)
  },

  persist: () => {
    const { project, nodes, edges } = get()
    const now = new Date().toISOString()
    const payload = { ...project, nodes, edges, updatedAt: now }
    saveProject(payload)
    set({ project: { ...project, updatedAt: now } })
  },

  getSelectedNode: () => {
    const { selectedNodeId, nodes } = get()
    return nodes.find((n) => n.id === selectedNodeId)
  },

  /** 单节点 AI 生成：text 走 Agent 回填文案；image/video/audio 走媒体生成 */
  generateNode: async (nodeId) => {
    const { nodes, edges, updateNodeData, cloudId } = get()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node?.type || node.type === 'group') return false

    const autoModel = node.data.autoModel !== false
    const resolvedModel =
      node.type === 'text'
        ? resolveAgentModel(node.data.model, autoModel)
        : resolveNodeModel(
            node.type as 'image' | 'video' | 'audio',
            node.data.model,
            autoModel,
          )

    if (node.type === 'text') {
      const userPrompt = (node.data.prompt || '').trim()
      if (!userPrompt) return false

      updateNodeData(nodeId, { status: 'generating', errorMessage: undefined })
      try {
        const context = buildCanvasContext(nodes, edges)
        const { reply } = await agentChat(
          `请根据以下需求直接生成文案内容，只输出最终文案正文，不要解释或添加前后缀：\n${userPrompt}`,
          context,
          undefined,
          cloudId ?? undefined,
          resolvedModel,
          autoModel,
        )
        const text = reply.trim()
        if (!text) throw new Error('未生成有效文案')
        updateNodeData(nodeId, { status: 'done', outputText: text })
        return true
      } catch (err) {
        updateNodeData(nodeId, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : '生成失败',
        })
        return false
      }
    }

    const nodeType = node.type as 'image' | 'video' | 'audio'
    const { upstreamText, upstreamImageUrl, upstreamImageUrls } = getUpstreamInputs(nodeId, nodes, edges)
    const appendPrompt = (node.data.prompt || '').trim()
    const effectivePrompt = buildEffectivePrompt(node, nodes, edges)
    if (!effectivePrompt) {
      updateNodeData(nodeId, {
        status: 'error',
        errorMessage: '请先连接文本节点或输入生成内容',
      })
      return false
    }

    updateNodeData(nodeId, { status: 'generating', errorMessage: undefined })

    try {
      const resultUrl = await apiGenerate({
        node_type: nodeType,
        prompt: appendPrompt,
        model: resolvedModel,
        auto: autoModel,
        upstream_text: upstreamText,
        upstream_image_url: upstreamImageUrl,
        upstream_image_urls: upstreamImageUrls,
        duration: node.data.duration,
        resolution: node.data.videoResolution,
        ratio: node.data.videoRatio,
        watermark: node.data.videoWatermark,
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
    const textId = generateUUID()
    const textNode: CanvasNode = {
      id: textId,
      type: 'text',
      position: { x: 80, y: 200 },
      style: { width: TEXT_NODE_DEFAULT_WIDTH, height: TEXT_NODE_DEFAULT_HEIGHT },
      data: {
        label: '脚本',
        prompt: script,
        outputText: script,
        status: 'done',
      },
    }

    const imageNodes: CanvasNode[] = scenes.map((scene, i) => ({
      id: generateUUID(),
      type: 'image' as const,
      position: nextToolbarNodePosition(i + 1),
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
      animated: false,
      style: { stroke: 'rgba(255, 255, 255, 0.35)', strokeWidth: 1.5 },
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
    const { cloudId, getProjectPayload } = get()
    if (!cloudId || !getToken()) return
    const payload = getProjectPayload()
    try {
      await patchProject(cloudId, { data: payload, name: payload.name })
    } catch {
      /* autosave best-effort */
    }
  },

  loadCloudProject: async (id) => {
    const row = await fetchCloudProject(id)
    get().loadProject({
      ...row.data,
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  },

  exportVideo: async () => {
    set({ exporting: true })
    try {
      const { nodes, edges } = get()
      const timeline = collectComposeTimeline(nodes, edges)
      if (!timeline.clips.length) {
        throw new Error('没有可合成的图片或视频，请先生成内容')
      }
      return await composeVideo(timeline)
    } finally {
      set({ exporting: false })
    }
  },
}))
