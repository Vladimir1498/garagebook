import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface Currency {
  code: string
  symbol: string
  label: string
}

export const CURRENCIES: Currency[] = [
  { code: 'BYN', symbol: 'Br', label: 'Белорусский рубль' },
  { code: 'RUB', symbol: '₽', label: 'Российский рубль' },
  { code: 'USD', symbol: '$', label: 'Доллар США' },
  { code: 'EUR', symbol: '€', label: 'Евро' },
  { code: 'UAH', symbol: '₴', label: 'Гривна' },
  { code: 'KZT', symbol: '₸', label: 'Тенге' },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (code: string) => void
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  formatAmount: (n) => `${n} Br`,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('currency') || 'BYN'
  })

  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0]

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code)
    localStorage.setItem('currency', code)
  }, [])

  const formatAmount = useCallback((amount: number) => {
    const formatted = amount.toLocaleString('ru', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    return `${formatted} ${currency.symbol}`
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
