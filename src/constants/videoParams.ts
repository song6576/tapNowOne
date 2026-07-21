export const VIDEO_RESOLUTIONS = ['720P', '1080P'] as const
export const VIDEO_RATIOS = [
  '16:9',
  '9:16',
  '3:4',
  '4:3',
  '4:5',
  '5:4',
  '1:1',
  '9:21',
  '21:9',
] as const
/** 与后端 normalizeVideoDuration(3–15) 对齐的常用可选时长 */
export const VIDEO_DURATIONS = [5, 10] as const

export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number]
export type VideoRatio = (typeof VIDEO_RATIOS)[number]
export type VideoDuration = (typeof VIDEO_DURATIONS)[number]

export const DEFAULT_VIDEO_RESOLUTION: VideoResolution = '720P'
export const DEFAULT_VIDEO_RATIO: VideoRatio = '16:9'
export const DEFAULT_VIDEO_DURATION: VideoDuration = 5

export function normalizeVideoDuration(
  value?: number,
  fallback: VideoDuration = DEFAULT_VIDEO_DURATION,
): VideoDuration {
  const n = Number.isFinite(value) ? Math.round(value as number) : fallback
  return (VIDEO_DURATIONS as readonly number[]).includes(n)
    ? (n as VideoDuration)
    : fallback
}

export function formatVideoParamsSummary(input: {
  ratio?: string
  resolution?: string
  duration?: number
  watermark?: boolean
}): string {
  const ratio = input.ratio ?? DEFAULT_VIDEO_RATIO
  const resolution = input.resolution ?? DEFAULT_VIDEO_RESOLUTION
  const duration = normalizeVideoDuration(input.duration)
  const watermark = input.watermark ? ' · watermark' : ''
  return `${ratio} · ${resolution} · ${duration}s${watermark}`
}
