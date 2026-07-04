import { useTranslation } from 'react-i18next'
import { Calendar, AlertTriangle } from 'lucide-react'

interface Event {
  id?: string
  title: string
  date: string
  car: string
  type: string
}

export default function UpcomingEvents({ items }: { items: Event[] }) {
  const { t } = useTranslation()

  if (!items.length) return null

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-800">
      <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">{t('dashboard.upcoming_events')}</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const daysLeft = Math.ceil((new Date(item.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysLeft <= 30
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-surface-100 dark:bg-surface-700'}`}>
                {isUrgent ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Calendar className="h-4 w-4 text-surface-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-surface-500">{item.car}</p>
              </div>
              <span className={`text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-surface-400'}`}>
                {daysLeft > 0 ? `через ${daysLeft} дн.` : 'сегодня'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
