/**
 * TapNow 1:1 复刻 — 静态 Mock 数据
 * 后续替换为后端 API 即可
 */

export const MOCK_USER = {
  id: 'u-demo',
  name: 'songhai220430',
  email: 'songhai220430@gmail.com',
  avatar: '',
  credits: 177,
  plan: 'FREE',
  uid: 'TN-8X4K2M9P',
}

export type MockProject = {
  id: string
  name: string
  updatedAt: string
  thumbnail?: string
  tag?: string
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'p1',
    name: 'Fresh Ideas (0702)',
    updatedAt: '2026-07-02T08:00:00Z',
    thumbnail: 'linear-gradient(135deg,#1a1a2e 0%,#4a5568 50%,#718096 100%)',
    tag: '体验 Midjourney V6.1...',
  },
  {
    id: 'p2',
    name: 'Creative Concept (0520)',
    updatedAt: '2026-07-01T18:00:00Z',
    thumbnail: 'linear-gradient(135deg,#2d1b4e 0%,#553c9a 50%,#9f7aea 100%)',
  },
  {
    id: 'p3',
    name: 'New Vision (0512)',
    updatedAt: '2026-07-01T10:00:00Z',
    thumbnail: 'linear-gradient(135deg,#1a365d 0%,#2b6cb0 50%,#63b3ed 100%)',
  },
  {
    id: 'p4',
    name: 'Design Sketch (0512)',
    updatedAt: '2026-05-12T08:00:00Z',
    thumbnail: 'linear-gradient(135deg,#27272a 0%,#52525b 50%,#a1a1aa 100%)',
  },
  {
    id: 'p5',
    name: 'HappyHorse (copy)',
    updatedAt: '2026-04-20T08:00:00Z',
    thumbnail: 'linear-gradient(135deg,#451a03 0%,#ea580c 50%,#fef08a 100%)',
  },
  {
    id: 'p6',
    name: '新手教学',
    updatedAt: '2026-03-15T08:00:00Z',
    thumbnail: 'linear-gradient(180deg,#1e3a8a 0%,#000000 100%)',
  },
]

export type FeaturedItem = {
  id: string
  title: string
  subtitle?: string
  cover: string
  link?: string
}

export const MOCK_FEATURED: FeaturedItem[] = [
  {
    id: 'f1',
    title: 'Midjourney V6.1 正式上线',
    cover: 'linear-gradient(160deg,#1a1a1a 0%,#4a3728 40%,#8b6914 100%)',
    link: '/taptv',
  },
  {
    id: 'f2',
    title: 'TapTV Arena —— 胜者一次',
    subtitle: '全球创作者竞技',
    cover: 'linear-gradient(160deg,#ff0080 0%,#7928ca 35%,#0070f3 70%,#00dfd8 100%)',
    link: '/taptv',
  },
  {
    id: 'f3',
    title: '体验 World Model...',
    subtitle: '下一代视频生成',
    cover: 'linear-gradient(160deg,#18181b 0%,#27272a 50%,#3f3f46 100%)',
    link: '/canvas',
  },
  {
    id: 'f4',
    title: 'Neon Dreams',
    cover: 'linear-gradient(160deg,#0f0f23 0%,#e11d48 50%,#7c3aed 100%)',
    link: '/taptv',
  },
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
  category: TapTVCategory
  publishedAt: string
  featured?: boolean
}

export type TapTVCategory =
  | 'all'
  | 'animation'
  | 'canvas'
  | 'ad'
  | 'anime'
  | 'short'
  | 'mv'
  | 'creative'
  | 'tutorial'
  | 'other'

export type TapTVSort = 'featured' | 'following' | 'hot' | 'latest'

export const TAPTV_CATEGORY_IDS: TapTVCategory[] = [
  'all', 'animation', 'canvas', 'ad', 'anime', 'short', 'mv', 'creative', 'tutorial', 'other',
]

export const MOCK_TAPTV: TapTVItem[] = [
  { id: 'tv1', title: 'MISFIT', author: 'STUDIO.707', authorAvatar: 'S', cover: 'linear-gradient(160deg,#0f172a 0%,#6366f1 50%,#ec4899 100%)', forks: 342, likes: 213, tags: ['动画'], nodeCount: 12, category: 'animation', publishedAt: '2026-07-01T12:00:00Z', featured: true },
  { id: 'tv2', title: 'TapNow', author: '顺宝', authorAvatar: '顺', cover: 'linear-gradient(160deg,#1c1917 0%,#f59e0b 60%,#fef3c7 100%)', forks: 891, likes: 143, tags: ['广告'], nodeCount: 8, category: 'ad', publishedAt: '2026-06-28T12:00:00Z', featured: true },
  { id: 'tv3', title: '电影感人物特写', author: 'CineAI', authorAvatar: 'C', cover: 'linear-gradient(160deg,#09090b 0%,#3f3f46 40%,#a1a1aa 100%)', forks: 156, likes: 66, tags: ['电影'], nodeCount: 15, category: 'creative', publishedAt: '2026-06-25T12:00:00Z' },
  { id: 'tv4', title: '日系动画风格分镜', author: 'AnimeFlow', authorAvatar: 'ア', cover: 'linear-gradient(160deg,#fdf2f8 0%,#f472b6 40%,#7c3aed 100%)', forks: 523, likes: 218, tags: ['动画'], nodeCount: 20, category: 'anime', publishedAt: '2026-06-20T12:00:00Z', featured: true },
  { id: 'tv5', title: '品牌 Logo 动效', author: 'BrandKit', authorAvatar: 'B', cover: 'linear-gradient(160deg,#ecfdf5 0%,#10b981 50%,#064e3b 100%)', forks: 267, likes: 94, tags: ['品牌'], nodeCount: 6, category: 'ad', publishedAt: '2026-06-15T12:00:00Z' },
  { id: 'tv6', title: '美食短视频工作流', author: 'FoodClip', authorAvatar: 'F', cover: 'linear-gradient(160deg,#451a03 0%,#ea580c 50%,#fef08a 100%)', forks: 412, likes: 156, tags: ['短视频'], nodeCount: 10, category: 'short', publishedAt: '2026-06-10T12:00:00Z' },
  { id: 'tv7', title: '赛博朋克城市漫游', author: 'NeoFrame', authorAvatar: 'N', cover: 'linear-gradient(160deg,#0f172a 0%,#22d3ee 50%,#a855f7 100%)', forks: 342, likes: 1205, tags: ['视频'], nodeCount: 12, category: 'animation', publishedAt: '2026-06-05T12:00:00Z' },
  { id: 'tv8', title: 'MV 视觉叙事', author: 'STUDIO_TOZ', authorAvatar: 'T', cover: 'linear-gradient(160deg,#18181b 0%,#dc2626 50%,#000 100%)', forks: 198, likes: 445, tags: ['MV'], nodeCount: 18, category: 'mv', publishedAt: '2026-06-01T12:00:00Z' },
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
  { path: '/home', labelKey: 'home' as const, icon: 'home' as const },
  { path: '/home/projects', labelKey: 'workspace' as const, icon: 'workspace' as const },
  { path: '/taptv', labelKey: 'taptv' as const, icon: 'taptv' as const },
  { path: '/arena', labelKey: 'arena' as const, icon: 'arena' as const, disabled: true },
]

export type AiModelTier = 'standard' | 'premium' | 'upcoming'

export type AiModelOption = {
  id: string
  label: string
  icon: string
  tier: AiModelTier
}

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { id: 'kimi-2.7', label: 'Kimi 2.7', icon: 'K', tier: 'standard' },
  { id: 'kimi-2.6', label: 'Kimi 2.6', icon: 'K', tier: 'standard' },
  { id: 'gpt-4o', label: 'GPT-4o', icon: 'G', tier: 'standard' },
  { id: 'claude-3.5', label: 'Claude 3.5', icon: 'C', tier: 'standard' },
  { id: 'qwen-max', label: 'Qwen Max', icon: 'Q', tier: 'standard' },
  { id: 'sonnet-4.6', label: 'Sonnet 4.6', icon: '✦', tier: 'premium' },
  { id: 'opus-4.8', label: 'Opus 4.8', icon: '✦', tier: 'premium' },
  { id: 'opus-4.7', label: 'Opus 4.7', icon: '✦', tier: 'premium' },
  { id: 'opus-4.6', label: 'Opus 4.6', icon: '✦', tier: 'premium' },
  { id: 'fable-5', label: 'Fable 5', icon: 'F', tier: 'upcoming' },
  { id: 'gpt-5.5', label: 'GPT-5.5', icon: 'G', tier: 'upcoming' },
]

/** @deprecated 使用 AI_MODEL_OPTIONS */
export const AI_MODELS = AI_MODEL_OPTIONS.filter((m) => m.tier === 'standard').map((m) => m.label)
