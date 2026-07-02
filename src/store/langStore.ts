import { create } from 'zustand'
import { getMessages } from '../i18n/messages'
import {
  htmlLangAttr,
  LANG_KEY,
  readStoredLang,
  type AppLang,
} from '../utils/lang'

interface LangStore {
  lang: AppLang
  init: () => void
  setLang: (lang: AppLang) => void
}

function applyDocumentLang(lang: AppLang) {
  document.documentElement.lang = htmlLangAttr(lang)
}

export const useLangStore = create<LangStore>((set) => ({
  lang: readStoredLang(),

  init: () => {
    const lang = readStoredLang()
    applyDocumentLang(lang)
    set({ lang })
  },

  setLang: (lang) => {
    localStorage.setItem(LANG_KEY, lang)
    applyDocumentLang(lang)
    set({ lang })
  },
}))

/** 订阅当前语言的文案包 */
export function useI18n() {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const t = getMessages(lang)
  return { lang, setLang, t }
}
