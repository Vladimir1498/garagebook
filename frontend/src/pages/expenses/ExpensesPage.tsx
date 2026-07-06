import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, DollarSign, Trash2, BarChart3, PieChart as PieIcon } from 'lucide-react'
import { useExpensesList, useDeleteExpense } from '../../hooks/useExpenses'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import ExpenseChart from '../../components/charts/ExpenseChart'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const categoryLabels: Record<string, string> = {
  fuel: 'Топливо', maintenance: 'ТО', repair: 'Ремонт', insurance: 'Страховка',
  tax: 'Налог', parking: 'Парковка', fine: 'Штраф', wash: 'Мойка', tires: 'Шины', other: 'Прочее',
}

const categoryColors: Record<string, string> = {
  fuel: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
  maintenance: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
  repair: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
  insurance: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400',
  tax: 'bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400',
  parking: 'bg-cyan-50 text-cyan-500 dark:bg-cyan-950/30 dark:text-cyan-400',
  fine: 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400',
  wash: 'bg-teal-50 text-teal-500 dark:bg-teal-950/30 dark:text-teal-400',
  tires: 'bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400',
  other: 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
}

export default function ExpensesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useExpensesList()
  const deleteExpense = useDeleteExpense()
  const [view, setView] = useState<'list' | 'chart'>('list')
  const expenses = data?.data?.data || []

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)
  const chartData = Object.entries(categoryTotals).map(([category, total]) => ({ category: categoryLabels[category] || category, total, count: 0 }))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('expenses.title')}</h1>
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
            Всего: <span className="font-semibold text-surface-700 dark:text-surface-200 tabular-nums">{totalExpenses.toLocaleString('ru')} ₽</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-surface-200 dark:border-surface-600">
            <button onClick={() => setView('list')} className={clsx('rounded-l-lg px-2.5 py-1.5 transition-colors', view === 'list' ? 'bg-primary-50 text-primary-500' : 'text-surface-400 hover:text-surface-600')}><BarChart3 className="h-4 w-4" /></button>
            <button onClick={() => setView('chart')} className={clsx('rounded-r-lg px-2.5 py-1.5 transition-colors', view === 'chart' ? 'bg-primary-50 text-primary-500' : 'text-surface-400 hover:text-surface-600')}><PieIcon className="h-4 w-4" /></button>
          </div>
          <Button onClick={() => navigate('/expenses/new')} iconLeft={<Plus />}>{t('expenses.add')}</Button>
        </div>
      </div>

      {view === 'chart' && chartData.length > 0 && (
        <div className="card p-4 sm:p-5">
          <ExpenseChart data={chartData} type="pie" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={<DollarSign className="h-7 w-7" />} title="Нет расходов" description="Добавьте первый расход" action={<Button onClick={() => navigate('/expenses/new')} iconLeft={<Plus />}>Добавить</Button>} />
      ) : (
        <div className="space-y-1.5 page-enter-stagger">
          {expenses.map((e) => (
            <div key={e.id} className="card flex items-center gap-3 p-3">
              <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', categoryColors[e.category] || categoryColors.other)}>
                <DollarSign className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{categoryLabels[e.category]}</p>
                <p className="text-xs text-surface-400">{e.description || new Date(e.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-surface-800 dark:text-white">{Number(e.amount).toLocaleString('ru')} ₽</p>
              <button onClick={() => { if (confirm('Удалить расход?')) deleteExpense.mutate(e.id, { onSuccess: () => toast.success('Расход удалён') }) }} className="shrink-0 rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
