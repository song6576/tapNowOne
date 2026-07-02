import { HoverDropdown } from './HoverDropdown'

export type AppLang = 'en' | 'zh' | 'ko' | 'fr'

export const LANG_OPTIONS: { id: AppLang; label: string; beta?: boolean }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
  { id: 'ko', label: '한국어' },
  { id: 'fr', label: 'Français', beta: true },
]

interface LanguageDropdownProps {
  value: AppLang
  onChange: (lang: AppLang) => void
  className?: string
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LanguageDropdown({ value, onChange, className = '' }: LanguageDropdownProps) {
  const current = LANG_OPTIONS.find((o) => o.id === value) ?? LANG_OPTIONS[1]

  return (
    <HoverDropdown
      align="right"
      className={className}
      panelClassName="ui-glass-panel min-w-[160px] overflow-hidden py-1"
      trigger={
        <button
          type="button"
          className="ui-glass-trigger flex items-center gap-1.5 px-3 py-2 text-[15px] text-white/85"
        >
          {current.label}
          <ChevronDown />
        </button>
      }
    >
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className="ui-clickable flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/5"
        >
          <span>
            {opt.label}
            {opt.beta && <span className="ml-1 text-white/40">Beta</span>}
          </span>
          {value === opt.id && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </HoverDropdown>
  )
}
