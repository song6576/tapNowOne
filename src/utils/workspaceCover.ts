import { formatCss, oklch } from 'culori'

/** 工作空间卡片封面：按 id 稳定分配高质量模糊图 + BlurHash 占位 */
export const WORKSPACE_COVER_POOL = [
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LcH1yt.hI+rZ{L+uXMSfAUjMw}XQ',
  },
  {
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=900&q=80',
    blurhash: 'L|NvM;*}q{sT}5WER-f*RROEkUfi',
  },
  {
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LM5jwUhegLkXiJeUe.e:e.f6fkfj',
  },
  {
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=900&q=80',
    blurhash: 'L88fBd9:1C=OI,xdW9NY1Wwd}KE^',
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LZ8Y*%,%z~s=pfoZnTofIlJWOkR~',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LUE2^XE1Rit7~XIoaxj]JWsks:R,',
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LWD]uKI[M{t7_4NMRQoftRt8j]bI',
  },
  {
    url: 'https://images.unsplash.com/photo-1493246507134-91eebbb63df6?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LcEy6~ofM{WW_4j[aeoLtmj[WXjt',
  },
  {
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LcEy6~ofM{WW_4j[aeoLtmj[WXjt',
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LXCjhRn#MwRj.ARjjEj[M^a}xuj]',
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LDAwDB~BbCtSx|oMM_R+005QWFV?',
  },
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    blurhash: 'L042MB%J00E200ITWCt700V^~q%M',
  },
  {
    url: 'https://images.unsplash.com/photo-1419242902214-272b259f7e5b?auto=format&fit=crop&w=900&q=80',
    blurhash: 'L042k?~q8^MwJE%g.9Mx0000Ri?w',
  },
  {
    url: 'https://images.unsplash.com/photo-1504196606676-a1655f893bea?auto=format&fit=crop&w=900&q=80',
    blurhash: 'L042k?~q8^MwJE%g.9Mx0000Ri?w',
  },
  {
    url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
  },
  {
    url: 'https://images.unsplash.com/photo-1528459803456-51650c942bdb?auto=format&fit=crop&w=900&q=80',
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
  },
] as const

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash
}

export function pickWorkspaceCoverEntry(id: string) {
  return WORKSPACE_COVER_POOL[hashId(id) % WORKSPACE_COVER_POOL.length]
}

export function pickWorkspaceCover(id: string): string {
  return pickWorkspaceCoverEntry(id).url
}

export function pickWorkspaceBlurhash(id: string): string {
  return pickWorkspaceCoverEntry(id).blurhash
}

/** culori：按 id 生成 OKLCH 多层径向渐变底色（无外链、即时渲染） */
export function pickCoverMeshGradient(id: string): string {
  const h = hashId(id)
  const hue1 = h % 360
  const hue2 = (hue1 + 48 + ((h >> 6) % 72)) % 360
  const hue3 = (hue1 + 118 + ((h >> 12) % 48)) % 360

  const c1 = formatCss(oklch({ mode: 'oklch', l: 0.44, c: 0.13, h: hue1 }))
  const c2 = formatCss(oklch({ mode: 'oklch', l: 0.36, c: 0.11, h: hue2 }))
  const c3 = formatCss(oklch({ mode: 'oklch', l: 0.3, c: 0.07, h: hue3 }))
  const base = formatCss(oklch({ mode: 'oklch', l: 0.16, c: 0.02, h: hue1 }))

  return [
    `radial-gradient(ellipse 90% 70% at 18% 28%, ${c1} 0%, transparent 68%)`,
    `radial-gradient(ellipse 75% 85% at 88% 18%, ${c2} 0%, transparent 62%)`,
    `radial-gradient(ellipse 95% 65% at 55% 100%, ${c3} 0%, transparent 58%)`,
    `linear-gradient(155deg, ${base} 0%, #0c0c10 100%)`,
  ].join(', ')
}

const FILE_MARK_COLORS = [
  'linear-gradient(135deg, #6b7c93 0%, #9aa8bc 100%)',
  'linear-gradient(135deg, #7a6b8e 0%, #b0a3c4 100%)',
  'linear-gradient(135deg, #5c6b7a 0%, #8fa0b0 100%)',
  'linear-gradient(135deg, #8a7b6a 0%, #c4b5a3 100%)',
] as const

export function pickFileAccents(id: string): string[] {
  const base = hashId(id)
  return [0, 1, 2].map((i) => FILE_MARK_COLORS[(base + i) % FILE_MARK_COLORS.length])
}

export function isImageCover(value?: string): boolean {
  return !!value && (value.startsWith('http') || value.startsWith('//'))
}

export function getWorkspaceCoverUrl(id: string, stored?: string): string {
  if (isImageCover(stored)) return stored!
  return pickWorkspaceCover(id)
}

export function getWorkspaceBlurhash(id: string, stored?: string): string {
  if (isImageCover(stored)) return pickWorkspaceBlurhash(id)
  return pickWorkspaceBlurhash(id)
}
