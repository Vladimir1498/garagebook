import { clsx } from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  className?: string
}

export default function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={clsx(
      'rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-800',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          {trend && (
            <p className={clsx('mt-1 text-xs font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className="rounded-xl bg-primary-50 p-2.5 text-primary-500 dark:bg-primary-900/20 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  )
}
