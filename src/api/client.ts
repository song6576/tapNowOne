/**
 * 真实后端 HTTP 客户端（/api 前缀，由 dev proxy 转发）。
 * 认证、项目 CRUD、生成任务、Agent 对话均在此定义。
 */
import { authHeaders } from '../utils/auth'
import type { User } from '../utils/auth'
import type { CanvasProject } from '../types'

export type GeneratePayload = {
  node_type: 'image' | 'video' | 'audio'
  prompt: string
  model?: string
  auto?: boolean
  upstream_text?: string
  upstream_image_url?: string
  duration?: number
}

export type TaskResult = {
  task_id: string
  state: 'pending' | 'running' | 'completed' | 'failed'
  result_url?: string
  error?: string
}

export type HealthStatus = {
  status: string
  mock_mode: boolean
  dashscope_configured: boolean
}

export type ProjectMeta = {
  id: string
  name: string
  folder_id?: string | null
  thumbnail?: string
  created_at: string
  updated_at: string
}

export type FolderMeta = {
  id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export type AgentConversationMeta = {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type AgentConversationDetail = {
  id: string
  project_id: string | null
  title: string | null
  created_at: string
  updated_at: string
  messages: Array<{
    id: string
    role: string
    content: string
    created_at: string
  }>
}

export type ComposeClip = {
  url: string
  type: 'image' | 'video'
  duration: number
}

export type StoryboardScene = {
  label: string
  prompt: string
}

export type AgentChatResult = {
  reply: string
  conversationId?: string
}

export type UploadResult = {
  url: string
  filename: string
  mime_type: string
  size: number
  category: 'project' | 'avatar' | 'banner'
}

const API_BASE = '/api'

/** 统一解析 FastAPI 风格错误响应 */
async function parseError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}))
  const detail = err.detail ?? err.message
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.join(', ')
  return `请求失败 (${res.status})`
}

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('后端未连接')
  return res.json()
}

// ── Auth ──

export async function login(email: string, password: string): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function register(email: string, password: string, name: string): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function loginWithGoogle(credential: string): Promise<{ access_token: string; user: User }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(await parseError(res))
    return res.json()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('登录请求超时，请检查后端网络或代理')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

// ── Uploads ──

/** 画布项目素材上传（图片 / 视频 / 音频） */
export async function uploadProjectAsset(
  file: File,
  projectId?: string,
): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', 'project')
  if (projectId) form.append('projectId', projectId)
  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** 头像上传，并更新 user.avatar_url */
export async function uploadAvatar(file: File): Promise<{ url: string; user: User }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/users/me/avatar`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** 个人主页背景图上传，并更新 user.banner_url */
export async function uploadBanner(file: File): Promise<{ url: string; banner_url: string; user: User }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/users/me/banner`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export type UpdateUserProfilePayload = {
  name?: string
  bio?: string
  socialLink?: string
  country?: string
  city?: string
  profession?: string
  showJoinDate?: boolean
}

/** 更新用户名与个人简介等资料 */
export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<User> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

// ── Folders ──

export async function listFolders(): Promise<FolderMeta[]> {
  const res = await fetch(`${API_BASE}/folders`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createFolder(name?: string, parentId?: string | null): Promise<FolderMeta> {
  const res = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, parentId: parentId ?? undefined }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateFolder(
  id: string,
  patch: { name?: string; parentId?: string | null },
): Promise<FolderMeta> {
  const res = await fetch(`${API_BASE}/folders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteFolder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/folders/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
}

// ── Projects ──

export async function listProjects(): Promise<ProjectMeta[]> {
  const res = await fetch(`${API_BASE}/projects`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getProject(id: string): Promise<{
  id: string
  name: string
  folder_id?: string | null
  thumbnail?: string
  data: CanvasProject
  created_at: string
  updated_at: string
}> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createProject(
  name?: string,
  folderId?: string | null,
  data?: CanvasProject,
): Promise<ProjectMeta> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, folderId: folderId ?? undefined, data }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function patchProject(
  id: string,
  patch: { name?: string; data?: CanvasProject; thumbnail?: string; folderId?: string | null },
): Promise<ProjectMeta> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function saveProjectCloud(name: string, data: CanvasProject, id?: string): Promise<ProjectMeta> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, data, id }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteProjectCloud(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
}

// ── Generation ──

export async function submitGenerate(payload: GeneratePayload): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function submitCompose(clips: ComposeClip[], audioUrl?: string): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/compose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clips, audio_url: audioUrl }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getTask(taskId: string): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`)
  if (!res.ok) throw new Error('查询任务失败')
  return res.json()
}

/** 轮询异步生成任务，直到完成/失败/超时 */
export async function pollTask(taskId: string, intervalMs = 1500, maxAttempts = 120): Promise<TaskResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const task = await getTask(taskId)
    if (task.state === 'completed') return task
    if (task.state === 'failed') throw new Error(task.error || '生成失败')
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error('生成超时')
}

// ── Agent ──

export async function agentChat(
  message: string,
  context?: string,
  conversationId?: string,
  projectId?: string,
  model?: string,
  auto = true,
): Promise<AgentChatResult> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message, context, conversationId, projectId, model, auto }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function listProjectConversations(projectId: string): Promise<AgentConversationMeta[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getConversation(id: string): Promise<AgentConversationDetail> {
  const res = await fetch(`${API_BASE}/agent/conversations/${id}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function agentStoryboard(
  script: string,
  model?: string,
  auto = true,
): Promise<StoryboardScene[]> {
  const res = await fetch(`${API_BASE}/agent/storyboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ script, model, auto }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return data.scenes
}
