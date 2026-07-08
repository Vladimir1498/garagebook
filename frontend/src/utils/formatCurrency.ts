// Lightweight currency formatter — reads from localStorage, no React context needed
const CURRENCY_SYMBOLS: Record<string, string> = {
  BYN: 'Br', RUB: '₽', USD: '$', EUR: '€', UAH: '₴', KZT: '₸',
}

export function getCurrencySymbol(): string {
  const code = localStorage.getItem('currency') || 'BYN'
  return CURRENCY_SYMBOLS[code] || 'Br'
}

export function formatMoney(amount: number): string {
  const symbol = getCurrencySymbol()
  const formatted = amount.toLocaleString('ru', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${formatted} ${symbol}`
}
