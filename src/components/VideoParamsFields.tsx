import {
  DEFAULT_VIDEO_DURATION,
  DEFAULT_VIDEO_RATIO,
  DEFAULT_VIDEO_RESOLUTION,
  VIDEO_RATIOS,
  VIDEO_RESOLUTIONS,
  type VideoRatio,
  type VideoResolution,
} from '../constants/videoParams'

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
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
          Duration (s)
        </label>
        <input
          type="number"
          min={3}
          max={15}
          value={duration ?? DEFAULT_VIDEO_DURATION}
          onChange={(e) => onChange({ duration: Number(e.target.value) })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">
          Resolution
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
          Aspect Ratio
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

      <label className="flex items-center gap-2 text-xs text-[var(--tn-text-secondary)]">
        <input
          type="checkbox"
          checked={watermark === true}
          onChange={(e) => onChange({ videoWatermark: e.target.checked })}
          className="rounded border-[var(--tn-border)]"
        />
        Add watermark
      </label>
    </div>
  )
}
