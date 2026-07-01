import { authHeaders } from '../utils/auth'
import type { User } from '../utils/auth'
import type { CanvasProject } from '../types'

export type GeneratePayload = {
  node_type: 'image' | 'video' | 'audio'
  prompt: string
  model?: string
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
  created_at: string
  updated_at: string
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

const API_BASE = '/api'

async function parseError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}))
  const detail = err.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg).join(', ')
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

export async function fetchMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

// ── Projects ──

export async function listProjects(): Promise<ProjectMeta[]> {
  const res = await fetch(`${API_BASE}/projects`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getProject(id: string): Promise<{ id: string; name: string; data: CanvasProject; created_at: string; updated_at: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { headers: { ...authHeaders() } })
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

export async function agentChat(message: string, context?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return data.reply
}

export async function agentStoryboard(script: string): Promise<StoryboardScene[]> {
  const res = await fetch(`${API_BASE}/agent/storyboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return data.scenes
}
