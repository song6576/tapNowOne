/**
 * 真实后端 HTTP 客户端（/api 前缀，由 dev proxy 转发）。
 * 认证、项目 CRUD、生成任务、Agent 对话均在此定义。
 */
import { authHeaders } from '../utils/auth'
import type { User } from '../utils/auth'
import type { CanvasProject } from '../types'
import type { AiModelsResponse } from '../types/aiModel'
import type { FeaturedItem, TapTVCategory, TapTVItem, TapTVSort } from '../types/taptv'

export type GeneratePayload = {
  node_type: 'image' | 'video' | 'audio'
  prompt: string
  model?: string
  auto?: boolean
  upstream_text?: string
  upstream_image_url?: string
  upstream_image_urls?: string[]
  duration?: number
  resolution?: string
  ratio?: string
  watermark?: boolean
}

export type TaskResult = {
  task_id: string
  state: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  result_url?: string
  error?: string
}

export type HealthStatus = {
  status: string
  dashscope_configured: boolean
  ark_configured?: boolean
  ffmpeg_configured?: boolean
  providers?: { dashscope: boolean; ark: boolean }
}

export type ProjectMeta = {
  id: string
  name: string
  folder_id?: string | null
  team_id?: string | null
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
  project_count?: number
}

export type WorkspaceSearchParams = {
  teamId?: string | null
  parentId?: string | null
  q?: string
  type?: 'all' | 'folders' | 'projects'
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  flat?: boolean
}

export type WorkspaceSearchResult = {
  folders: FolderMeta[]
  projects: ProjectMeta[]
  current_folder?: FolderMeta | null
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
  node_id: string
  url: string
  type: 'image' | 'video'
  duration: number
}

export type ComposeCaption = {
  text: string
  start: number
  end: number
}

export type ComposeAudioTrack = {
  url: string
  start: number
  volume: number
}

export type ComposeTimeline = {
  clips: ComposeClip[]
  captions: ComposeCaption[]
  audio_tracks: ComposeAudioTrack[]
  width: number
  height: number
  fps: number
}

export type StoryboardScene = {
  label: string
  prompt: string
}

export type AgentChatResult = {
  reply: string
  conversationId?: string
  actions?: Array<{
    type: 'add_node'
    node_type: 'text' | 'image' | 'video' | 'audio'
    label?: string
    prompt?: string
    count?: number
  }>
}

export type UploadResult = {
  url: string
  key?: string
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

/** 画布项目素材上传（图片 / 视频 / 音频）— 优先预签名直传对象存储 */
export async function uploadProjectAsset(
  file: File,
  projectId?: string,
): Promise<UploadResult> {
  try {
    return await uploadProjectAssetViaPresign(file, projectId)
  } catch (err) {
    // 对象存储未启用或 CORS 未配好时回退 multipart
    if (err instanceof Error && /对象存储未启用|CORS|Failed to fetch|NetworkError/i.test(err.message)) {
      return uploadProjectAssetMultipart(file, projectId)
    }
    // presign 404/501 等也回退
    try {
      return await uploadProjectAssetMultipart(file, projectId)
    } catch {
      throw err
    }
  }
}

async function uploadProjectAssetViaPresign(
  file: File,
  projectId?: string,
): Promise<UploadResult> {
  const presignRes = await fetch(`${API_BASE}/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
      category: 'project',
      project_id: projectId,
      size: file.size,
    }),
  })
  if (!presignRes.ok) throw new Error(await parseError(presignRes))
  const ticket = (await presignRes.json()) as {
    key: string
    upload_url: string
    public_url: string
    headers?: Record<string, string>
  }

  const putHeaders: Record<string, string> = {
    ...(ticket.headers ?? {}),
    'Content-Type': file.type || 'application/octet-stream',
  }
  const putRes = await fetch(ticket.upload_url, {
    method: 'PUT',
    headers: putHeaders,
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`直传对象存储失败 (${putRes.status})`)
  }

  const completeRes = await fetch(`${API_BASE}/uploads/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      key: ticket.key,
      filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      size: file.size,
      category: 'project',
    }),
  })
  if (!completeRes.ok) throw new Error(await parseError(completeRes))
  return completeRes.json()
}

async function uploadProjectAssetMultipart(
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

// ── Teams ──

export type TeamMeta = {
  id: string
  name: string
  public_id: string
  initial: string
  tapies_balance: number
  role: string
  is_owner: boolean
}

export type TeamsListResponse = {
  active_team_id: string | null
  personal_tapies_balance: number
  personal_name: string | null
  teams: TeamMeta[]
}

function teamScopeQuery(teamId?: string | null) {
  if (!teamId) return ''
  return `?teamId=${encodeURIComponent(teamId)}`
}

function workspaceSearchQuery(params: WorkspaceSearchParams) {
  const qs = new URLSearchParams()
  if (params.teamId) qs.set('teamId', params.teamId)
  if (params.parentId) qs.set('parentId', params.parentId)
  if (params.q?.trim()) qs.set('q', params.q.trim())
  if (params.type && params.type !== 'all') qs.set('type', params.type)
  if (params.sortBy) qs.set('sortBy', params.sortBy)
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder)
  if (params.flat) qs.set('flat', 'true')
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export async function listTeams(): Promise<TeamsListResponse> {
  const res = await fetch(`${API_BASE}/teams`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createTeam(name: string): Promise<TeamMeta & { active_team_id: string }> {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function switchActiveTeam(teamId: string | null): Promise<{ active_team_id: string | null }> {
  const res = await fetch(`${API_BASE}/teams/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ teamId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export type TeamMemberRow = {
  user_id: number
  name: string
  email: string
  avatar_url: string | null
  role: string
  quota_used: number
  quota_limit: number | null
  is_self: boolean
}

export type TeamInviteLink = {
  token: string
  url: string
  expires_at: string
  expires_in_days: number
  unlimited_quota: boolean
  use_count: number
  max_uses: number | null
}

export type TeamInvitePreview = {
  team_name: string | null
  member_count: number
  expires_at: string | null
  unlimited_quota: boolean
  valid: boolean
  reason: string | null
}

export async function listTeamMembers(teamId: string): Promise<{ members: TeamMemberRow[] }> {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/members`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function removeTeamMember(teamId: string, userId: number): Promise<{ removed_user_id: number }> {
  const res = await fetch(
    `${API_BASE}/teams/${encodeURIComponent(teamId)}/members/${userId}`,
    { method: 'DELETE', headers: { ...authHeaders() } },
  )
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getTeamInviteLink(teamId: string): Promise<TeamInviteLink> {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/invite-link`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function regenerateTeamInviteLink(teamId: string): Promise<TeamInviteLink> {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/invite-link/regenerate`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateTeamInviteLink(
  teamId: string,
  body: { expiresInDays?: number; unlimitedQuota?: boolean },
): Promise<TeamInviteLink> {
  const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}/invite-link`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function previewTeamInvite(token: string): Promise<TeamInvitePreview> {
  const res = await fetch(`${API_BASE}/teams/invites/${encodeURIComponent(token)}`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function acceptTeamInvite(token: string): Promise<{
  team_id: string
  team_name: string
  role: string
  active_team_id: string
}> {
  const res = await fetch(`${API_BASE}/teams/invites/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

// ── Folders ──

export async function searchWorkspace(params: WorkspaceSearchParams = {}): Promise<WorkspaceSearchResult> {
  const res = await fetch(`${API_BASE}/workspace${workspaceSearchQuery(params)}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function listFolders(teamId?: string | null): Promise<FolderMeta[]> {
  const res = await fetch(`${API_BASE}/folders${teamScopeQuery(teamId)}`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createFolder(
  name?: string,
  parentId?: string | null,
  teamId?: string | null,
): Promise<FolderMeta> {
  const res = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, parentId: parentId ?? undefined, teamId: teamId ?? undefined }),
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

export async function listProjects(teamId?: string | null): Promise<ProjectMeta[]> {
  const res = await fetch(`${API_BASE}/projects${teamScopeQuery(teamId)}`, { headers: { ...authHeaders() } })
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
  teamId?: string | null,
): Promise<ProjectMeta> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      name,
      folderId: folderId ?? undefined,
      data,
      teamId: teamId ?? undefined,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function patchProject(
  id: string,
  patch: {
    name?: string
    data?: CanvasProject
    thumbnail?: string
    folderId?: string | null
    teamId?: string | null
  },
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
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function submitCompose(timeline: ComposeTimeline): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/compose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(timeline),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getTask(taskId: string): Promise<TaskResult> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error('查询任务失败')
  return res.json()
}

/** 轮询异步生成任务，默认允许 Seedance / FFmpeg 最长约 10 分钟 */
export async function pollTask(taskId: string, intervalMs = 1500, maxAttempts = 400): Promise<TaskResult> {
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

// ── Home / TapTV ──
// 接口完整说明见 backend-nest/docs/API.md；数据库字段见 docs/SQL.md §7

/** 后端 GET /api/home/featured 单条结构 */
export type FeaturedBannerMeta = {
  id: string
  title: string
  subtitle?: string
  cover: string
  video_url?: string
  link?: string
}

/**
 * 后端 TapTV 作品 JSON（snake_case）。
 * cover → 列表封面；video_url → 悬浮播放；liked_by_me / favorited_by_me 需登录才有意义。
 */
export type TapTVItemMeta = {
  id: string
  title: string
  author: string
  author_avatar: string
  author_user_id?: number | null
  cover: string
  video_url: string
  description?: string
  producer?: string
  forks: number
  likes: number
  favorites: number
  shares: number
  tags: string[]
  node_count: number
  category: string
  published_at: string
  featured?: boolean
  liked_by_me?: boolean
  favorited_by_me?: boolean
  following_author?: boolean
}

export function mapFeaturedItem(row: FeaturedBannerMeta): FeaturedItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cover: row.cover,
    videoUrl: row.video_url,
    link: row.link,
  }
}

/** 将后端 snake_case 转为前端 TapTVItem（camelCase） */
export function mapTapTVItem(row: TapTVItemMeta): TapTVItem {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    authorAvatar: row.author_avatar,
    authorUserId: row.author_user_id,
    cover: row.cover,
    videoUrl: row.video_url,
    description: row.description,
    producer: row.producer,
    forks: row.forks,
    likes: row.likes,
    favorites: row.favorites,
    shares: row.shares,
    tags: row.tags,
    nodeCount: row.node_count,
    category: row.category as TapTVItem['category'],
    publishedAt: row.published_at,
    featured: row.featured,
    likedByMe: row.liked_by_me,
    favoritedByMe: row.favorited_by_me,
    followingAuthor: row.following_author,
  }
}

export type TapTVListParams = {
  sort?: TapTVSort
  category?: TapTVCategory
  search?: string
  limit?: number
  page?: number
}

function buildTapTVQuery(params?: TapTVListParams) {
  const q = new URLSearchParams()
  if (params?.sort) q.set('sort', params.sort)
  if (params?.category && params.category !== 'all') q.set('category', params.category)
  if (params?.search?.trim()) q.set('search', params.search.trim())
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.page) q.set('page', String(params.page))
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** GET /api/models — AI 模型目录（按分类 / 节点类型过滤） */
export async function fetchAiModels(params?: {
  category?: string
  node_type?: string
}): Promise<AiModelsResponse> {
  const q = new URLSearchParams()
  if (params?.category) q.set('category', params.category)
  if (params?.node_type) q.set('node_type', params.node_type)
  const qs = q.toString()
  const res = await fetch(`${API_BASE}/models${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** GET /api/home/featured — 首页精选轮播 */
export async function listFeatured(): Promise<FeaturedItem[]> {
  const res = await fetch(`${API_BASE}/home/featured`)
  if (!res.ok) throw new Error(await parseError(res))
  const rows = (await res.json()) as FeaturedBannerMeta[]
  return rows.map(mapFeaturedItem)
}

export type HomeDashboardResponse = {
  featured: FeaturedBannerMeta[]
  taptv: TapTVItemMeta[]
}

export type HomeDashboard = {
  featured: FeaturedItem[]
  taptv: TapTVItem[]
}

/** GET /api/home/dashboard — 首页聚合（精选 + TapTV 预览） */
export async function fetchHomeDashboard(): Promise<HomeDashboard> {
  const res = await fetch(`${API_BASE}/home/dashboard`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as HomeDashboardResponse
  return {
    featured: data.featured.map(mapFeaturedItem),
    taptv: data.taptv.map(mapTapTVItem),
  }
}

/**
 * GET /api/taptv — 作品列表
 * @param params.sort featured | following | hot | latest
 * @param params.category 分类 slug，all 表示全部
 */
export async function listTapTV(params?: TapTVListParams): Promise<TapTVItem[]> {
  const res = await fetch(`${API_BASE}/taptv${buildTapTVQuery(params)}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  const rows = (await res.json()) as TapTVItemMeta[]
  return rows.map(mapTapTVItem)
}

/** GET /api/taptv/:id — 作品详情；404 返回 undefined */
export async function getTapTVItem(id: string): Promise<TapTVItem | undefined> {
  const res = await fetch(`${API_BASE}/taptv/${id}`, {
    headers: { ...authHeaders() },
  })
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(await parseError(res))
  const row = (await res.json()) as TapTVItemMeta
  return mapTapTVItem(row)
}

export async function getTapTVWorkflow(id: string): Promise<CanvasProject> {
  const res = await fetch(`${API_BASE}/taptv/${id}/workflow`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<CanvasProject>
}

/**
 * GET /api/taptv/favorites — 我的收藏（需登录）
 * 后端查 taptv_favorite，按收藏时间倒序；用于 ProfilePage「我的收藏」
 */
export async function listTapTVFavorites(): Promise<TapTVItem[]> {
  const res = await fetch(`${API_BASE}/taptv/favorites`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  const rows = (await res.json()) as TapTVItemMeta[]
  return rows.map(mapTapTVItem)
}

/**
 * POST /api/taptv/:id/like — 切换点赞
 * @returns liked 当前是否已赞；likes 更新后总数（前端用于点亮图标）
 */
export async function toggleTapTVLike(id: string): Promise<{ liked: boolean; likes: number }> {
  const res = await fetch(`${API_BASE}/taptv/${id}/like`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/**
 * POST /api/taptv/:id/favorite — 切换收藏
 * @returns favorited 当前是否已藏；favorites 更新后总数
 */
export async function toggleTapTVFavorite(id: string): Promise<{ favorited: boolean; favorites: number }> {
  const res = await fetch(`${API_BASE}/taptv/${id}/favorite`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function recordTapTVShare(id: string): Promise<{ shares: number }> {
  const res = await fetch(`${API_BASE}/taptv/${id}/share`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export type MediaFavoriteMeta = {
  id: string
  media_url: string
  media_type: 'video' | 'image' | string
  title?: string | null
  cover_url?: string | null
  project_id?: string | null
  node_id?: string | null
  created_at: string
  favorited?: boolean
}

export type ToggleMediaFavoritePayload = {
  mediaUrl: string
  mediaType: 'video' | 'image'
  title?: string
  coverUrl?: string
  projectId?: string
  nodeId?: string
}

const MEDIA_FAV_COVER =
  'linear-gradient(160deg,#1a1a1e 0%,#2d2d35 45%,#111827 100%)'

export function mapMediaFavoriteItem(row: MediaFavoriteMeta): TapTVItem {
  return {
    id: row.id,
    title: row.title?.trim() || (row.media_type === 'image' ? '画布图片' : '画布视频'),
    author: '我',
    authorAvatar: '我',
    cover: row.cover_url?.trim() || MEDIA_FAV_COVER,
    videoUrl: row.media_url,
    forks: 0,
    likes: 0,
    favorites: 1,
    shares: 0,
    tags: ['画布'],
    nodeCount: 0,
    category: 'canvas',
    publishedAt: row.created_at,
    favoritedByMe: true,
    source: 'media',
    projectId: row.project_id,
  }
}

/** GET /api/media-favorites — 画布素材收藏 */
export async function listMediaFavorites(): Promise<TapTVItem[]> {
  const res = await fetch(`${API_BASE}/media-favorites`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  const rows = (await res.json()) as MediaFavoriteMeta[]
  return rows.map(mapMediaFavoriteItem)
}

/** GET /api/media-favorites/status?url= */
export async function getMediaFavoriteStatus(
  mediaUrl: string,
): Promise<{ favorited: boolean; id?: string }> {
  const q = new URLSearchParams({ url: mediaUrl })
  const res = await fetch(`${API_BASE}/media-favorites/status?${q}`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/media-favorites/toggle */
export async function toggleMediaFavorite(
  payload: ToggleMediaFavoritePayload,
): Promise<{ favorited: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/media-favorites/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      mediaUrl: payload.mediaUrl,
      mediaType: payload.mediaType,
      title: payload.title,
      coverUrl: payload.coverUrl,
      projectId: payload.projectId,
      nodeId: payload.nodeId,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function followTapTVUser(userId: number): Promise<{ following: boolean }> {
  const res = await fetch(`${API_BASE}/taptv/users/${userId}/follow`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function cloneTapTVWork(id: string): Promise<ProjectMeta> {
  const res = await fetch(`${API_BASE}/taptv/${id}/clone`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export type PublishTapTVPayload = {
  title: string
  description?: string
  projectId: string
  videoUrl: string
  coverUrl?: string
  subtitleUrl?: string
  category?: string
}

/**
 * POST /api/taptv/publish — 从画布发布作品
 * coverUrl 写入 taptv_work.cover；videoUrl 用于列表悬浮播放
 */
export async function publishTapTV(payload: PublishTapTVPayload): Promise<{ id: string; title: string; message: string }> {
  const res = await fetch(`${API_BASE}/taptv/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

// ── Billing 计费 ──
// 接口说明见 backend-nest/docs/API.md

export type BillingCycle = 'monthly' | 'yearly' | 'enterprise'

export type ProTierMeta = {
  tapies: number
  label: string
  price_cny: number
  original_cny: number
}

export type PlanMeta = {
  slug: string
  name: string
  tagline: string
  price_cny: number
  original_cny: number
  billing_note: string
  monthly_tapies: number
  recharge_rate: string
  recharge_bonus_pct: number
  badge?: string
  highlight?: boolean
  pro_tiers?: ProTierMeta[]
}

export type EnterprisePlanMeta = {
  slug: string
  name: string
  headline: string
  subtitle: string
  features: string[]
  partner_logos: { name: string; label: string }[]
  contact_cta: string
}

export type GiftPackMeta = {
  id: string
  model_name: string
  tier: string
  price_usd: number
  price_display: string
  tapies_amount: number
  tapies_label: string
  bg_gradient: string
  stock_total: number
  stock_remaining: number
}

export type TeamBenefitsMeta = {
  scope: 'personal' | 'team'
  team_id: string | null
  public_id: string | null
  name: string
  tapies_balance: number
  plan_slug: string
  plan_name: string
  cycle: string | null
  pro_tapies: number | null
  quotas: {
    user_id: number
    name: string
    email: string
    role: string
    quota_used: number
    quota_limit: number | null
    unlimited: boolean
  }[]
}

export type RedemptionRecordMeta = {
  code: string
  activity: string
  time: string
  points: number
}

export type TransactionMeta = {
  id: string
  time: string
  type: string
  desc: string
  operator: string
  amount: string
  status: string
}

/** GET /api/billing/plans?cycle= */
export async function listBillingPlans(cycle: BillingCycle) {
  const res = await fetch(`${API_BASE}/billing/plans?cycle=${cycle}`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{
    cycle: BillingCycle
    plans: PlanMeta[]
    enterprise: EnterprisePlanMeta | null
  }>
}

/** GET /api/billing/gift-packs */
export async function listGiftPacks(): Promise<GiftPackMeta[]> {
  const res = await fetch(`${API_BASE}/billing/gift-packs`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** GET /api/billing/team-benefits?team_id= */
export async function getTeamBenefits(teamId?: string | null): Promise<TeamBenefitsMeta> {
  const q = teamId ? `?team_id=${encodeURIComponent(teamId)}` : ''
  const res = await fetch(`${API_BASE}/billing/team-benefits${q}`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/billing/subscribe */
export async function subscribePlan(payload: {
  plan_slug: string
  cycle: BillingCycle
  pro_tapies?: number
  team_id?: string
}) {
  const res = await fetch(`${API_BASE}/billing/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/billing/recharge */
export async function rechargeTapies(payload: { tapies_amount: number; team_id?: string }) {
  const res = await fetch(`${API_BASE}/billing/recharge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/billing/gift-packs/:id/purchase */
export async function purchaseGiftPack(id: string, teamId?: string) {
  const res = await fetch(`${API_BASE}/billing/gift-packs/${id}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ team_id: teamId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** GET /api/billing/rewards/history */
export async function listRedemptionHistory(): Promise<RedemptionRecordMeta[]> {
  const res = await fetch(`${API_BASE}/billing/rewards/history`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/billing/rewards/redeem */
export async function redeemCode(payload: { code: string; team_id?: string }) {
  const res = await fetch(`${API_BASE}/billing/rewards/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** POST /api/billing/rewards/generate — 临时生成兑换码（验证用） */
export async function generateRedemptionCode(payload: {
  activity_name: string
  tapies_amount: number
  max_uses?: number
  expires_days?: number
}) {
  const res = await fetch(`${API_BASE}/billing/rewards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

/** GET /api/billing/transactions */
export async function listBillingTransactions(params?: { page?: number; team_id?: string }) {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.team_id) q.set('team_id', params.team_id)
  const s = q.toString()
  const res = await fetch(`${API_BASE}/billing/transactions${s ? `?${s}` : ''}`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{ total: number; page: number; items: TransactionMeta[] }>
}
