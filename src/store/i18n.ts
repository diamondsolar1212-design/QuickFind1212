'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/lib/i18n/translations'
import { translations, type TranslationKey } from '@/lib/i18n/translations'

interface I18nState {
  lang: Language
  setLang: (lang: Language) => void
  toggle: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === 'en' ? 'hi' : 'en' }),
      t: (key, vars) => {
        const dict = translations[get().lang] as Record<string, string>
        let str = dict[key] ?? (translations.en[key] as string) ?? key
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
          }
        }
        return str
      }
    }),
    { name: 'businesshub-lang' }
  )
)
