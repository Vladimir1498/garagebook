import { useTranslation } from 'react-i18next'
import { Wrench, DollarSign, FileText, Bell } from 'lucide-react'

interface Activity {
  id: string
  type: string
  title: string
  date: string
  car: string
}

const icons: Record<string, typeof Wrench> = {
  maintenance: Wrench,
  expense: DollarSign,
  document: FileText,
  reminder: Bell,
}

export default function RecentActivity({ items }: { items: Activity[] }) {
  const { t } = useTranslation()

  if (!items.length) return null

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-800">
      <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">{t('dashboard.recent_activity')}</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = icons[item.type] || Wrench
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="rounded-lg bg-surface-100 p-2 dark:bg-surface-700">
                <Icon className="h-4 w-4 text-surface-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-surface-500">{item.car}</p>
              </div>
              <span className="text-xs text-surface-400">{new Date(item.date).toLocaleDateString('ru')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
