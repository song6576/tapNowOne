export type AppLang = 'en' | 'zh' | 'ko' | 'fr'

export const LANG_KEY = 'tapflow_lang'

export const LANG_OPTIONS: { id: AppLang; label: string; beta?: boolean }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
  { id: 'ko', label: '한국어' },
  { id: 'fr', label: 'Français', beta: true },
]

export function isAppLang(value: string): value is AppLang {
  return LANG_OPTIONS.some((o) => o.id === value)
}

export function getLangLabel(lang: AppLang): string {
  return LANG_OPTIONS.find((o) => o.id === lang)?.label ?? '简体中文'
}

export function readStoredLang(): AppLang {
  try {
    const raw = localStorage.getItem(LANG_KEY)
    if (raw && isAppLang(raw)) return raw
  } catch { /* ignore */ }
  return 'zh'
}

export function htmlLangAttr(lang: AppLang): string {
  if (lang === 'zh') return 'zh-CN'
  return lang
}
