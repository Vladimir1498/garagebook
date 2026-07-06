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
    <div className={clsx('card p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="mt-1.5 stat-value truncate">{value}</p>
          {trend && (
            <p className={clsx('mt-1.5 text-xs font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-950/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  )
}
