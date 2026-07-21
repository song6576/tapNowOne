/** 属性面板：视频比例 / 清晰度 / 时长 / 水印（与 VideoParamsPicker、backend 对齐） */
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
} from '../constants/videoParams'
import { useI18n } from '../store/langStore'

const inputCls =
  'w-full rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] px-3 py-2 text-xs text-[var(--tn-text-secondary)] outline-none focus:border-zinc-500'

type VideoParamsFieldsProps = {
  duration?: number
  resolution?: string
  ratio?: string
  watermark?: boolean
  onChange: (patch: {
    duration?: number
    videoResolution?: VideoResolution
    videoRatio?: VideoRatio
    videoWatermark?: boolean
  }) => void
}

export function VideoParamsFields({
  duration,
  resolution,
  ratio,
  watermark,
  onChange,
}: VideoParamsFieldsProps) {
  const { t } = useI18n()
  const v = t.canvas.videoParams

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
          {v.ratio}
        </label>
        <select
          value={ratio ?? DEFAULT_VIDEO_RATIO}
          onChange={(e) => onChange({ videoRatio: e.target.value as VideoRatio })}
          className={inputCls}
        >
          {VIDEO_RATIOS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
          {v.resolution}
        </label>
        <select
          value={resolution ?? DEFAULT_VIDEO_RESOLUTION}
          onChange={(e) =>
            onChange({ videoResolution: e.target.value as VideoResolution })
          }
          className={inputCls}
        >
          {VIDEO_RESOLUTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
          {v.duration}
        </label>
        <select
          value={normalizeVideoDuration(duration ?? DEFAULT_VIDEO_DURATION)}
          onChange={(e) => onChange({ duration: Number(e.target.value) as VideoDuration })}
          className={inputCls}
        >
          {VIDEO_DURATIONS.map((item) => (
            <option key={item} value={item}>
              {item}{v.secondsSuffix}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-[var(--tn-text-secondary)]">
        <input
          type="checkbox"
          checked={watermark === true}
          onChange={(e) => onChange({ videoWatermark: e.target.checked })}
          className="rounded border-[var(--tn-border)]"
        />
        {v.watermark}
      </label>
    </div>
  )
}
