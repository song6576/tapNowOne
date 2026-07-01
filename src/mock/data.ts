/**
 * TapNow 1:1 复刻 — 静态 Mock 数据
 * 后续替换为后端 API 即可
 */

export const MOCK_USER = {
  id: 'u-demo',
  name: 'Creator',
  email: 'demo@tapnow.local',
  avatar: '',
  credits: 1280,
  plan: 'Free',
  uid: 'TN-8X4K2M9P',
}

export type MockProject = {
  id: string
  name: string
  updatedAt: string
  thumbnail?: string
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: 'p1', name: '咖啡广告 30s', updatedAt: '2026-07-01T10:00:00Z', thumbnail: 'linear-gradient(135deg,#1e1b4b,#312e81)' },
  { id: 'p2', name: '产品发布短片', updatedAt: '2026-06-28T15:30:00Z', thumbnail: 'linear-gradient(135deg,#134e4a,#065f46)' },
  { id: 'p3', name: '分镜测试', updatedAt: '2026-06-25T09:00:00Z', thumbnail: 'linear-gradient(135deg,#431407,#7c2d12)' },
]

export type TapTVItem = {
  id: string
  title: string
  author: string
  authorAvatar: string
  cover: string
  forks: number
  likes: number
  tags: string[]
  nodeCount: number
}

export const MOCK_TAPTV: TapTVItem[] = [
  { id: 'tv1', title: '赛博朋克城市漫游', author: 'NeoFrame', authorAvatar: 'N', cover: 'linear-gradient(160deg,#0f172a 0%,#6366f1 50%,#ec4899 100%)', forks: 342, likes: 1205, tags: ['视频', '分镜'], nodeCount: 12 },
  { id: 'tv2', title: '电商产品展示模板', author: 'AdLab', authorAvatar: 'A', cover: 'linear-gradient(160deg,#1c1917 0%,#f59e0b 60%,#fef3c7 100%)', forks: 891, likes: 2340, tags: ['广告', '模板'], nodeCount: 8 },
  { id: 'tv3', title: '电影感人物特写', author: 'CineAI', authorAvatar: 'C', cover: 'linear-gradient(160deg,#09090b 0%,#3f3f46 40%,#a1a1aa 100%)', forks: 156, likes: 678, tags: ['电影', '人像'], nodeCount: 15 },
  { id: 'tv4', title: '日系动画风格分镜', author: 'AnimeFlow', authorAvatar: 'ア', cover: 'linear-gradient(160deg,#fdf2f8 0%,#f472b6 40%,#7c3aed 100%)', forks: 523, likes: 1890, tags: ['动画', '分镜'], nodeCount: 20 },
  { id: 'tv5', title: '品牌 Logo 动效', author: 'BrandKit', authorAvatar: 'B', cover: 'linear-gradient(160deg,#ecfdf5 0%,#10b981 50%,#064e3b 100%)', forks: 267, likes: 945, tags: ['品牌', '动效'], nodeCount: 6 },
  { id: 'tv6', title: '美食短视频工作流', author: 'FoodClip', authorAvatar: 'F', cover: 'linear-gradient(160deg,#451a03 0%,#ea580c 50%,#fef08a 100%)', forks: 412, likes: 1567, tags: ['美食', '短视频'], nodeCount: 10 },
]

export type GenerationTask = {
  id: string
  type: 'image' | 'video' | 'audio' | 'text'
  label: string
  status: 'done' | 'generating' | 'error'
  thumbnail?: string
  nodeId?: string
  createdAt: string
}

export const MOCK_TASKS: GenerationTask[] = [
  { id: 't1', type: 'image', label: '分镜 1', status: 'done', thumbnail: 'linear-gradient(135deg,#312e81,#6366f1)', nodeId: 'n1', createdAt: '2026-07-01T12:01:00Z' },
  { id: 't2', type: 'video', label: '片段 A', status: 'done', thumbnail: 'linear-gradient(135deg,#713f12,#f59e0b)', nodeId: 'n2', createdAt: '2026-07-01T12:03:00Z' },
  { id: 't3', type: 'audio', label: '配音', status: 'generating', createdAt: '2026-07-01T12:05:00Z' },
]

export const NODE_MENU_ITEMS = [
  { type: 'text' as const, label: '文本', icon: 'T', desc: 'Script / Prompt' },
  { type: 'image' as const, label: '图片', icon: '🖼', desc: 'Text to Image' },
  { type: 'video' as const, label: '视频', icon: '🎬', desc: 'Image to Video' },
  { type: 'audio' as const, label: '音频', icon: '🔊', desc: 'TTS / Music' },
  { type: 'group' as const, label: '分组', icon: '▦', desc: 'Group nodes' },
]

export const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '⌂' },
  { path: '/taptv', label: 'TapTV', icon: '▶' },
  { path: '/home/projects', label: 'Projects', icon: '▤' },
]
