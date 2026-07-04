/** AI 模型选择：Auto（默认 qwen-plus）+ 百炼模型列表 */
import { useEffect, useState } from 'react'
import { AI_MODEL_OPTIONS, type AiModelOption } from '../../config/agentModels'
import { useI18n } from '../../store/langStore'
import { HoverDropdown } from './HoverDropdown'

interface ModelDropdownProps {
  value: string
  onChange: (modelId: string) => void
  auto?: boolean
  onAutoChange?: (auto: boolean) => void
}

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

function ModelIcon({ model }: { model: AiModelOption }) {
  return <span className="model-dropdown-icon">{model.icon}</span>
}

function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: AiModelOption
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`model-dropdown-item ui-clickable ${selected ? 'model-dropdown-item--active' : ''}`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <ModelIcon model={model} />
        <span className="truncate text-sm text-white/90">{model.label}</span>
      </span>
      {selected && <CheckIcon />}
    </button>
  )
}

export function ModelDropdown({ value, onChange, auto = true, onAutoChange }: ModelDropdownProps) {
  const { t } = useI18n()
  const m = t.home.model
  const [autoEnabled, setAutoEnabled] = useState(auto)

  useEffect(() => {
    setAutoEnabled(auto)
  }, [auto])

  const current = AI_MODEL_OPTIONS.find((o) => o.id === value) ?? AI_MODEL_OPTIONS[0]

  const toggleAuto = () => {
    const next = !autoEnabled
    setAutoEnabled(next)
    onAutoChange?.(next)
  }

  const selectModel = (id: string) => {
    setAutoEnabled(false)
    onAutoChange?.(false)
    onChange(id)
  }

  return (
    <HoverDropdown
      mode="click"
      align="left"
      panelClassName="model-dropdown-panel ui-glass-panel max-h-[min(420px,60vh)] overflow-y-auto py-1"
      trigger={
        <button type="button" className="model-dropdown-trigger ui-clickable">
          <ModelIcon model={current} />
          <span className="text-sm text-white/85">{autoEnabled ? m.auto : current.label}</span>
          <ChevronDown />
        </button>
      }
    >
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

      {AI_MODEL_OPTIONS.map((model) => (
        <ModelRow
          key={model.id}
          model={model}
          selected={!autoEnabled && value === model.id}
          onSelect={() => selectModel(model.id)}
        />
      ))}

      <div className="model-dropdown-footer">
        <button type="button" className="model-dropdown-footer-btn ui-clickable">
          <span className="text-white/40">?</span>
          <span className="flex-1 text-left text-sm text-white/55">{m.howToChoose}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </HoverDropdown>
  )
}
