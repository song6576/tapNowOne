import { HoverDropdown } from './HoverDropdown'
import { useLangStore } from '../../store/langStore'
import { LANG_OPTIONS, type AppLang } from '../../utils/lang'

export type { AppLang }

interface LanguageDropdownProps {
  className?: string
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LanguageDropdown({ className = '' }: LanguageDropdownProps) {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const current = LANG_OPTIONS.find((o) => o.id === lang) ?? LANG_OPTIONS[1]

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
          onClick={() => setLang(opt.id)}
          className="ui-clickable flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/5"
        >
          <span>
            {opt.label}
            {opt.beta && <span className="ml-1 text-white/40">Beta</span>}
          </span>
          {lang === opt.id && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </HoverDropdown>
  )
}
