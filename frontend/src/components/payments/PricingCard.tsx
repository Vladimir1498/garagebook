import { Check } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

interface PricingCardProps {
  name: string
  price: string
  period: string
  features: string[]
  isCurrent?: boolean
  isPopular?: boolean
  onSelect: () => void
  loading?: boolean
}

export default function PricingCard({ name, price, period, features, isCurrent, isPopular, onSelect, loading }: PricingCardProps) {
  return (
    <div className={`relative rounded-2xl border bg-white p-6 shadow-card transition-all duration-200 dark:bg-surface-800 ${
      isPopular ? 'border-primary-500 shadow-lg scale-105' : 'border-surface-200 dark:border-surface-700'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="info" size="md">Популярный</Badge>
        </div>
      )}
      <h3 className="text-lg font-bold text-surface-900 dark:text-white">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-surface-900 dark:text-white">{price}</span>
        <span className="text-sm text-surface-500">{period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
            <Check className="h-4 w-4 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {isCurrent ? (
          <Button variant="secondary" className="w-full" disabled>Текущий план</Button>
        ) : (
          <Button className="w-full" onClick={onSelect} loading={loading}>Выбрать</Button>
        )}
      </div>
    </div>
  )
}
