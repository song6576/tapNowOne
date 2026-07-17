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

export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number]
export type VideoRatio = (typeof VIDEO_RATIOS)[number]

export const DEFAULT_VIDEO_RESOLUTION: VideoResolution = '720P'
export const DEFAULT_VIDEO_RATIO: VideoRatio = '16:9'
export const DEFAULT_VIDEO_DURATION = 5

export function formatVideoParamsSummary(input: {
  ratio?: string
  resolution?: string
  duration?: number
  watermark?: boolean
}): string {
  const ratio = input.ratio ?? DEFAULT_VIDEO_RATIO
  const resolution = input.resolution ?? DEFAULT_VIDEO_RESOLUTION
  const duration = input.duration ?? DEFAULT_VIDEO_DURATION
  const watermark = input.watermark ? ' · watermark' : ''
  return `${ratio} · ${resolution} · ${duration}s${watermark}`
}
