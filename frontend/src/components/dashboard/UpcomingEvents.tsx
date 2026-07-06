import { Calendar, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

interface Event {
  id?: string
  title: string
  date: string
  car: string
  type: string
}

export default function UpcomingEvents({ items }: { items: Event[] }) {
  if (!items.length) return null

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Ближайшие события</h3>
      <div className="space-y-0">
        {items.map((item) => {
          const daysLeft = Math.ceil((new Date(item.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysLeft <= 30
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <div className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                isUrgent ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400' : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
              )}>
                {isUrgent ? <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{item.title}</p>
                <p className="truncate text-xs text-surface-400">{item.car}</p>
              </div>
              <span className={clsx('shrink-0 text-xs font-medium tabular-nums', isUrgent ? 'text-red-500' : 'text-surface-400 dark:text-surface-500')}>
                {daysLeft > 0 ? `${daysLeft} дн.` : 'сегодня'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
