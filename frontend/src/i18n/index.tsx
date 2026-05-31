import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import ar from './ar'
import en from './en'

type Locale = 'ar' | 'en'

const translations: Record<Locale, Record<string, string>> = { ar, en }

interface I18nContextType {
  t: (key: string, params?: Record<string, string | number>) => string
  locale: Locale
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextType>({
  t: (key: string) => key,
  locale: 'ar',
  setLocale: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('locale') as Locale) || 'ar'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const t = (key: string, params?: Record<string, string | number>): string => {
    let val = translations[locale]?.[key]
    if (!val) val = translations['ar']?.[key]
    if (!val) val = key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v))
      })
    }
    return val
  }

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => useContext(I18nContext)
