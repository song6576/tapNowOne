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
    name: 'seedance2...',
    updatedAt: '2026-07-02T08:00:00Z',
    thumbnail: 'linear-gradient(135deg,#1a1a2e 0%,#4a5568 50%,#718096 100%)',
    tag: '体验最新的 Seedance...',
  },
  {
    id: 'p2',
    name: 'Untitled',
    updatedAt: '2026-07-01T18:00:00Z',
    thumbnail: 'linear-gradient(135deg,#2d1b4e 0%,#553c9a 50%,#9f7aea 100%)',
    tag: '体验最新的 Seedance...',
  },
  {
    id: 'p3',
    name: 'Untitled',
    updatedAt: '2026-07-01T10:00:00Z',
    thumbnail: 'linear-gradient(135deg,#1a365d 0%,#2b6cb0 50%,#63b3ed 100%)',
    tag: '体验最新的 Seedance...',
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
  videoUrl?: string
  link?: string
}

export const MOCK_FEATURED: FeaturedItem[] = [
  {
    id: 'f1',
    title: 'TapNow Launches ChatGPT Images 2.0',
    subtitle: '实现创意·更清晰·更流畅',
    cover: 'linear-gradient(160deg,#1a1a1a 0%,#4a3728 40%,#8b6914 100%)',
    link: '/taptv',
  },
  {
    id: 'f2',
    title: 'Seedance 2.0 Now Live',
    subtitle: '体验创意·更清晰·更流畅',
    cover: 'linear-gradient(160deg,#ff0080 0%,#7928ca 35%,#0070f3 70%,#00dfd8 100%)',
    link: '/taptv',
  },
  {
    id: 'f3',
    title: 'Introducing Agentic Canvas',
    subtitle: '体验创意·更清晰·更流畅',
    cover: 'linear-gradient(160deg,#18181b 0%,#27272a 50%,#3f3f46 100%)',
    link: '/canvas',
  },
  {
    id: 'f4',
    title: 'WORLD MODEL',
    subtitle: '下一代视频生成',
    cover: 'linear-gradient(160deg,#0f0f23 0%,#e11d48 50%,#7c3aed 100%)',
    link: '/taptv',
  },
]

export type TapTVItem = {
  id: string
  title: string
  author: string
  authorAvatar: string
  authorUserId?: number | null
  cover: string
  videoUrl: string
  description?: string
  producer?: string
  forks: number
  likes: number
  favorites: number
  shares: number
  tags: string[]
  nodeCount: number
  category: TapTVCategory
  publishedAt: string
  featured?: boolean
  likedByMe?: boolean
  favoritedByMe?: boolean
  followingAuthor?: boolean
  /** taptv=社区作品；media=画布星标素材 */
  source?: 'taptv' | 'media'
  projectId?: string | null
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
  { id: 'tv1', title: 'MISFIT', author: 'STUDIO.707', authorAvatar: 'S', cover: 'linear-gradient(160deg,#0f172a 0%,#6366f1 50%,#ec4899 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'STUDIO.707 原创动画短片', forks: 342, likes: 213, favorites: 88, shares: 45, tags: ['动画'], nodeCount: 12, category: 'animation', publishedAt: '2026-07-01T12:00:00Z', featured: true },
  { id: 'tv2', title: '全AI世界杯广告 联想 × 阿迪达斯 | 2026 FIFA世界杯 「一起上场」', author: '婧宝宝', authorAvatar: '婧', cover: 'linear-gradient(160deg,#1c1917 0%,#14532d 45%,#166534 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: '联想AI内容智创中心 | 出品\n特别鸣谢：tapnow AI技术合作伙伴', producer: '联想AI内容智创中心', forks: 891, likes: 104, favorites: 143, shares: 60, tags: ['广告'], nodeCount: 28, category: 'ad', publishedAt: '2026-06-28T12:00:00Z', featured: true },
  { id: 'tv3', title: '电影感人物特写', author: 'CineAI', authorAvatar: 'C', cover: 'linear-gradient(160deg,#09090b 0%,#3f3f46 40%,#a1a1aa 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: '电影级人物特写镜头工作流', forks: 156, likes: 66, favorites: 52, shares: 18, tags: ['电影'], nodeCount: 15, category: 'creative', publishedAt: '2026-06-25T12:00:00Z' },
  { id: 'tv4', title: '日系动画风格分镜', author: 'AnimeFlow', authorAvatar: 'ア', cover: 'linear-gradient(160deg,#fdf2f8 0%,#f472b6 40%,#7c3aed 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: '日系动画风格分镜与视频生成流程', forks: 523, likes: 218, favorites: 176, shares: 92, tags: ['动画'], nodeCount: 20, category: 'anime', publishedAt: '2026-06-20T12:00:00Z', featured: true },
  { id: 'tv5', title: '品牌 Logo 动效', author: 'BrandKit', authorAvatar: 'B', cover: 'linear-gradient(160deg,#ecfdf5 0%,#10b981 50%,#064e3b 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: '品牌 Logo 动效生成流程', forks: 267, likes: 94, favorites: 71, shares: 33, tags: ['品牌'], nodeCount: 6, category: 'ad', publishedAt: '2026-06-15T12:00:00Z' },
  { id: 'tv6', title: '美食短视频工作流', author: 'FoodClip', authorAvatar: 'F', cover: 'linear-gradient(160deg,#451a03 0%,#ea580c 50%,#fef08a 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: '美食短视频从脚本到成片', forks: 412, likes: 156, favorites: 98, shares: 41, tags: ['短视频'], nodeCount: 10, category: 'short', publishedAt: '2026-06-10T12:00:00Z' },
  { id: 'tv7', title: '赛博朋克城市漫游', author: 'NeoFrame', authorAvatar: 'N', cover: 'linear-gradient(160deg,#0f172a 0%,#22d3ee 50%,#a855f7 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: '赛博朋克城市漫游长镜头', forks: 342, likes: 1205, favorites: 890, shares: 210, tags: ['视频'], nodeCount: 12, category: 'animation', publishedAt: '2026-06-05T12:00:00Z' },
  { id: 'tv8', title: 'MV 视觉叙事', author: 'STUDIO_TOZ', authorAvatar: 'T', cover: 'linear-gradient(160deg,#18181b 0%,#dc2626 50%,#000 100%)', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', description: 'MV 视觉叙事全流程', forks: 198, likes: 445, favorites: 312, shares: 88, tags: ['MV'], nodeCount: 18, category: 'mv', publishedAt: '2026-06-01T12:00:00Z' },
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

export type { AiModelOption } from '../config/agentModels'
export {
  AI_MODEL_OPTIONS,
  DEFAULT_AGENT_MODEL,
  resolveAgentModel,
} from '../config/agentModels'

import { AI_MODEL_OPTIONS } from '../config/agentModels'

/** @deprecated 使用 AI_MODEL_OPTIONS */
export const AI_MODELS = AI_MODEL_OPTIONS.map((m) => m.label)
