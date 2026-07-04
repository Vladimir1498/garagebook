import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wrench, DollarSign, FileText } from 'lucide-react'

const actions = [
  { key: 'add_maintenance', icon: Wrench, path: '/maintenance/new', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  { key: 'add_expense', icon: DollarSign, path: '/expenses/new', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
  { key: 'add_document', icon: FileText, path: '/documents', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
]

export default function QuickActions() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-700 dark:bg-surface-800">
      <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">{t('dashboard.quick_actions')}</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ key, icon: Icon, path, color }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-700"
          >
            <div className={`rounded-xl p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t(`dashboard.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
