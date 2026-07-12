/** AI 模型选择：分类列表、悬浮说明侧栏（左侧动态定位）、即将上线 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useAiModels } from '../../hooks/useAiModels'
import { useI18n } from '../../store/langStore'
import type { AiModel, AiModelCategory } from '../../types/aiModel'

interface ModelDropdownProps {
  value: string
  onChange: (modelId: string) => void
  auto?: boolean
  onAutoChange?: (auto: boolean) => void
  compact?: boolean
  /** 仅展示某分类；不传则展示全部分组 */
  category?: AiModelCategory
  /** 按画布节点类型过滤，如 video / audio */
  nodeType?: string
  /** 下拉面板对齐：hero 区放右侧，与触发按钮正对 */
  align?: 'left' | 'right'
}

const CATEGORY_ORDER: AiModelCategory[] = ['text', 'image', 'video', 'audio']

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/75">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ModelIcon({ model, premium }: { model: AiModel; premium?: boolean }) {
  return (
    <span className={`model-dropdown-icon ${premium || model.is_premium ? 'model-dropdown-icon--premium' : ''}`}>
      {model.icon}
    </span>
  )
}

function TierBadge({ tier, label }: { tier: string | null; label: string }) {
  if (!tier) return null
  return <span className="model-dropdown-tier">{label}</span>
}

function ModelDetailPanel({ model, premiumHint }: { model: AiModel; premiumHint: string }) {
  return (
    <div className="model-dropdown-detail ui-glass-panel">
      <div className="model-dropdown-detail-head">
        <ModelIcon model={model} premium />
        <span className="model-dropdown-detail-title">{model.label}</span>
        {model.is_premium && (
          <span className="model-dropdown-detail-premium" title={premiumHint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </div>
      <p className="model-dropdown-detail-desc">{model.description}</p>
      {(model.usage_hint || model.is_premium) && (
        <p className="model-dropdown-detail-hint">
          {model.usage_hint || premiumHint}
        </p>
      )}
    </div>
  )
}

function ModelRow({
  model,
  selected,
  disabled,
  tierLabel,
  comingSoonLabel,
  onHover,
  onSelect,
}: {
  model: AiModel
  selected?: boolean
  disabled?: boolean
  tierLabel?: string
  comingSoonLabel?: string
  onHover: (el: HTMLElement) => void
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={(e) => onHover(e.currentTarget)}
      onFocus={(e) => onHover(e.currentTarget)}
      onClick={onSelect}
      className={`model-dropdown-item ui-clickable ${selected ? 'model-dropdown-item--active' : ''} ${disabled ? 'model-dropdown-item--disabled' : ''}`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <ModelIcon model={model} />
        <span className="truncate text-sm text-white/90">{model.label}</span>
        {tierLabel && <TierBadge tier={model.tier} label={tierLabel} />}
      </span>
      {disabled ? (
        <span className="model-dropdown-soon-tag">{comingSoonLabel}</span>
      ) : selected ? (
        <CheckIcon />
      ) : null}
    </button>
  )
}

export function ModelDropdown({
  value,
  onChange,
  auto = true,
  onAutoChange,
  compact = false,
  category,
  nodeType,
  align = 'left',
}: ModelDropdownProps) {
  const { t } = useI18n()
  const m = t.home.model
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const hoveredRowRef = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [autoEnabled, setAutoEnabled] = useState(auto)
  const [hovered, setHovered] = useState<AiModel | null>(null)
  const [detailTop, setDetailTop] = useState(0)

  const { data } = useAiModels({ category, nodeType })

  useEffect(() => {
    setAutoEnabled(auto)
  }, [auto])

  useEffect(() => {
    if (!open) {
      setHovered(null)
      setDetailTop(0)
      hoveredRowRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /** 说明浮窗贴在列表左侧，垂直对齐当前悬停行，并夹在面板可视区内 */
  const syncDetailPosition = useCallback((rowEl: HTMLElement) => {
    const panel = panelRef.current
    if (!panel) return

    const panelRect = panel.getBoundingClientRect()
    const rowRect = rowEl.getBoundingClientRect()
    let top = rowRect.top - panelRect.top

    const detailH = detailRef.current?.offsetHeight ?? 120
    const maxTop = Math.max(0, panel.offsetHeight - detailH)
    top = Math.min(Math.max(0, top), maxTop)
    setDetailTop(top)
  }, [])

  useLayoutEffect(() => {
    if (!hovered || !hoveredRowRef.current) return
    syncDetailPosition(hoveredRowRef.current)
  }, [hovered, syncDetailPosition])

  const categoryLabels: Record<AiModelCategory, string> = useMemo(
    () => ({
      text: m.categoryText,
      image: m.categoryImage,
      video: m.categoryVideo,
      audio: m.categoryAudio,
    }),
    [m.categoryText, m.categoryImage, m.categoryVideo, m.categoryAudio],
  )

  const tierLabels = {
    high: m.tierHigh,
    medium: m.tierMedium,
  }

  const sections = useMemo(() => {
    if (!data) return []
    const cats = category ? [category] : CATEGORY_ORDER
    return cats
      .map((cat) => ({
        category: cat,
        label: categoryLabels[cat],
        models: data.by_category[cat] ?? [],
      }))
      .filter((s) => s.models.length > 0)
  }, [data, category, categoryLabels])

  const allSelectable = data?.models ?? []
  const current =
    allSelectable.find((o) => o.slug === value) ??
    allSelectable[0] ??
    data?.coming_soon[0]

  const toggleAuto = () => {
    const next = !autoEnabled
    setAutoEnabled(next)
    onAutoChange?.(next)
  }

  const selectModel = (slug: string) => {
    setAutoEnabled(false)
    onAutoChange?.(false)
    onChange(slug)
    setOpen(false)
  }

  const handleHover = (model: AiModel, el: HTMLElement) => {
    hoveredRowRef.current = el
    setHovered(model)
    syncDetailPosition(el)
  }

  const detailStyle: CSSProperties = { top: detailTop }

  return (
    <div ref={rootRef} className={`model-dropdown-root model-dropdown-root--${align}`}>
      <button
        type="button"
        className={`model-dropdown-trigger ui-clickable ${compact ? 'model-dropdown-trigger--compact' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current && <ModelIcon model={current} />}
        <span className={compact ? 'max-w-[120px] truncate text-xs text-white/85' : 'text-sm text-white/85'}>
          {autoEnabled ? m.auto : current?.label ?? m.auto}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div className={`model-dropdown-popover model-dropdown-popover--${align}`}>
          <div ref={panelRef} className="model-dropdown-panel ui-glass-panel">
            <div className="model-dropdown-auto-row">
              <span className="text-sm text-white/85">{m.auto}</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoEnabled}
                onClick={toggleAuto}
                className={`model-toggle ${autoEnabled ? 'model-toggle--on' : ''}`}
              >
                <span className="model-toggle-knob" />
              </button>
            </div>

            {sections.map((section) => (
              <div key={section.category} className="model-dropdown-section">
                <div className="model-dropdown-section-label">{section.label}</div>
                {section.models.map((model) => (
                  <ModelRow
                    key={model.slug}
                    model={model}
                    selected={!autoEnabled && value === model.slug}
                    tierLabel={model.tier ? tierLabels[model.tier as keyof typeof tierLabels] : undefined}
                    comingSoonLabel={m.comingSoon}
                    onHover={(el) => handleHover(model, el)}
                    onSelect={() => selectModel(model.slug)}
                  />
                ))}
              </div>
            ))}

            {(data?.coming_soon.length ?? 0) > 0 && (
              <div className="model-dropdown-section">
                <div className="model-dropdown-section-label">{m.comingSoon}</div>
                {data!.coming_soon.map((model) => (
                  <ModelRow
                    key={model.slug}
                    model={model}
                    disabled
                    comingSoonLabel={m.comingSoon}
                    onHover={(el) => handleHover(model, el)}
                  />
                ))}
              </div>
            )}

            <div className="model-dropdown-footer">
              <button type="button" className="model-dropdown-footer-btn ui-clickable">
                <span className="text-white/40">?</span>
                <span className="flex-1 text-left text-sm text-white/55">{m.howToChoose}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {hovered && (
            <div ref={detailRef} className="model-dropdown-detail-anchor" style={detailStyle}>
              <ModelDetailPanel model={hovered} premiumHint={m.premiumHint} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
