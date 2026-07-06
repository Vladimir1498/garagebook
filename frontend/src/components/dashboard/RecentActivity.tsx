import { Wrench, DollarSign, FileText, Bell } from 'lucide-react'
import { clsx } from 'clsx'

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

const colorMap: Record<string, string> = {
  maintenance: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
  expense: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
  document: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400',
  reminder: 'bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400',
}

export default function RecentActivity({ items }: { items: Activity[] }) {
  if (!items.length) return null

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Недавняя активность</h3>
      <div className="space-y-0">
        {items.map((item, i) => {
          const Icon = icons[item.type] || Wrench
          const color = colorMap[item.type] || 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', color)}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{item.title}</p>
                <p className="truncate text-xs text-surface-400">{item.car}</p>
              </div>
              <span className="shrink-0 text-xs text-surface-400 tabular-nums dark:text-surface-500">
                {new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
