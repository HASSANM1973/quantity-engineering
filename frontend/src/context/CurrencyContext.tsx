import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type CurrencyCode = 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED' | 'GBP'

const CURRENCY_INFO: Record<CurrencyCode, { symbol: string }> = {
  EGP: { symbol: 'ج.م' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  SAR: { symbol: 'SAR' },
  AED: { symbol: 'AED' },
  GBP: { symbol: '£' },
}

export const CURRENCY_OPTIONS = Object.keys(CURRENCY_INFO) as CurrencyCode[]

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  formatPrice: (value: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'EGP',
  setCurrency: () => {},
  formatPrice: (v) => String(v),
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('currency') as CurrencyCode) || 'EGP'
  })

  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  const formatPrice = (value: number): string => {
    const info = CURRENCY_INFO[currency]
    const locale = currency === 'EGP' ? 'ar-EG' : 'en'
    return `${value.toLocaleString(locale)} ${info.symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
