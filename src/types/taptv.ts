export type FeaturedItem = {
  id: string
  title: string
  subtitle?: string
  cover: string
  videoUrl?: string
  link?: string
}

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
  'all',
  'animation',
  'canvas',
  'ad',
  'anime',
  'short',
  'mv',
  'creative',
  'tutorial',
  'other',
]
