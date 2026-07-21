/** 视频节点参数选择：比例 / 清晰度 / 时长（与 backend video-params 对齐） */
import type { ReactNode } from 'react'
import { HoverDropdown } from './HoverDropdown'
import {
  DEFAULT_VIDEO_DURATION,
  DEFAULT_VIDEO_RATIO,
  DEFAULT_VIDEO_RESOLUTION,
  VIDEO_DURATIONS,
  VIDEO_RATIOS,
  VIDEO_RESOLUTIONS,
  normalizeVideoDuration,
  type VideoDuration,
  type VideoRatio,
  type VideoResolution,
} from '../../constants/videoParams'
import { useI18n } from '../../store/langStore'

export type VideoParamsValue = {
  videoRatio?: VideoRatio
  videoResolution?: VideoResolution
  duration?: number
}

type VideoParamsPickerProps = {
  ratio?: string
  resolution?: string
  duration?: number
  onChange: (patch: VideoParamsValue) => void
  /** 内联编辑器紧凑触发器 */
  compact?: boolean
  disabled?: boolean
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ParamsSummary({
  ratio,
  resolution,
  duration,
  secondsSuffix,
}: {
  ratio: VideoRatio
  resolution: VideoResolution
  duration: VideoDuration
  secondsSuffix: string
}) {
  return (
    <span className="video-params-picker-summary">
      <span>{ratio}</span>
      <i aria-hidden />
      <span>{resolution}</span>
      <i aria-hidden />
      <span>{duration}{secondsSuffix}</span>
    </span>
  )
}

function ParamSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="video-params-picker-section">
      <p className="video-params-picker-label">{label}</p>
      <div className="video-params-picker-chips" role="radiogroup" aria-label={label}>{children}</div>
    </div>
  )
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`video-params-chip ui-clickable${active ? ' is-active' : ''}`}
      onClick={onClick}
      role="radio"
      aria-checked={active}
    >
      {children}
    </button>
  )
}

export function VideoParamsPicker({
  ratio,
  resolution,
  duration,
  onChange,
  compact = false,
  disabled = false,
}: VideoParamsPickerProps) {
  const { t } = useI18n()
  const v = t.canvas.videoParams

  const currentRatio = (VIDEO_RATIOS as readonly string[]).includes(ratio ?? '')
    ? (ratio as VideoRatio)
    : DEFAULT_VIDEO_RATIO
  const currentResolution = (VIDEO_RESOLUTIONS as readonly string[]).includes(resolution ?? '')
    ? (resolution as VideoResolution)
    : DEFAULT_VIDEO_RESOLUTION
  const currentDuration = normalizeVideoDuration(duration ?? DEFAULT_VIDEO_DURATION)

  const panel = (
    <div className="video-params-picker-panel nowheel nopan nodrag">
      <ParamSection label={v.ratio}>
        {VIDEO_RATIOS.map((item) => (
          <Chip
            key={item}
            active={item === currentRatio}
            onClick={() => onChange({ videoRatio: item })}
          >
            {item}
          </Chip>
        ))}
      </ParamSection>
      <ParamSection label={v.resolution}>
        {VIDEO_RESOLUTIONS.map((item) => (
          <Chip
            key={item}
            active={item === currentResolution}
            onClick={() => onChange({ videoResolution: item })}
          >
            {item}
          </Chip>
        ))}
      </ParamSection>
      <ParamSection label={v.duration}>
        {VIDEO_DURATIONS.map((item) => (
          <Chip
            key={item}
            active={item === currentDuration}
            onClick={() => onChange({ duration: item as VideoDuration })}
          >
            {item}{v.secondsSuffix}
          </Chip>
        ))}
      </ParamSection>
    </div>
  )

  if (disabled) {
    return (
      <span className={`video-params-picker-trigger${compact ? ' is-compact' : ''} is-disabled`}>
        <ParamsSummary
          ratio={currentRatio}
          resolution={currentResolution}
          duration={currentDuration}
          secondsSuffix={v.secondsSuffix}
        />
      </span>
    )
  }

  return (
    <HoverDropdown
      mode="click"
      align="left"
      side="bottom"
      className="video-params-picker"
      panelClassName="video-params-picker-dropdown"
      trigger={
        <button
          type="button"
          className={`video-params-picker-trigger ui-clickable${compact ? ' is-compact' : ''}`}
          title={v.title}
          aria-label={v.title}
        >
          <ParamsSummary
            ratio={currentRatio}
            resolution={currentResolution}
            duration={currentDuration}
            secondsSuffix={v.secondsSuffix}
          />
          <ChevronDown />
        </button>
      }
    >
      {panel}
    </HoverDropdown>
  )
}
