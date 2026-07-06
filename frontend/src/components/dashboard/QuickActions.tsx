import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wrench, DollarSign, FileText } from 'lucide-react'
import { clsx } from 'clsx'

const actions = [
  { key: 'add_maintenance', icon: Wrench, path: '/maintenance/new', color: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400' },
  { key: 'add_expense', icon: DollarSign, path: '/expenses/new', color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400' },
  { key: 'add_document', icon: FileText, path: '/documents', color: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400' },
]

export default function QuickActions() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">{t('dashboard.quick_actions')}</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ key, icon: Icon, path, color }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-surface-50 dark:hover:bg-surface-700/50"
          >
            <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105', color)}>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-medium text-surface-600 dark:text-surface-300">{t(`dashboard.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
