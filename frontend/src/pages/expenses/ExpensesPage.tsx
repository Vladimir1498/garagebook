import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, DollarSign, Trash2, BarChart3, PieChart as PieIcon } from 'lucide-react'
import { useExpensesList, useDeleteExpense } from '../../hooks/useExpenses'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import ExpenseChart from '../../components/charts/ExpenseChart'
import toast from 'react-hot-toast'

const categoryLabels: Record<string, string> = {
  fuel: 'Топливо', maintenance: 'ТО', repair: 'Ремонт', insurance: 'Страховка',
  tax: 'Налог', parking: 'Парковка', fine: 'Штраф', wash: 'Мойка', tires: 'Шины', other: 'Прочее',
}

const categoryColors: Record<string, string> = {
  fuel: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20', maintenance: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
  repair: 'bg-red-50 text-red-600 dark:bg-red-900/20', insurance: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
  tax: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20', parking: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20',
  fine: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20', wash: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20',
  tires: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20', other: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20',
}

export default function ExpensesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useExpensesList()
  const deleteExpense = useDeleteExpense()
  const [view, setView] = useState<'list' | 'chart'>('list')
  const expenses = data?.data?.data || []

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)
  const chartData = Object.entries(categoryTotals).map(([category, total]) => ({ category: categoryLabels[category] || category, total, count: 0 }))

  return (
    <PageWrapper
      title={t('expenses.title')}
      action={
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-surface-200 dark:border-surface-700">
            <button onClick={() => setView('list')} className={`rounded-l-xl p-2 ${view === 'list' ? 'bg-primary-50 text-primary-500' : 'text-surface-400'}`}><BarChart3 className="h-4 w-4" /></button>
            <button onClick={() => setView('chart')} className={`rounded-r-xl p-2 ${view === 'chart' ? 'bg-primary-50 text-primary-500' : 'text-surface-400'}`}><PieIcon className="h-4 w-4" /></button>
          </div>
          <Button onClick={() => navigate('/expenses/new')}><Plus className="h-4 w-4" />{t('expenses.add')}</Button>
        </div>
      }
    >
      {view === 'chart' && chartData.length > 0 && (
        <div className="mb-6 rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
          <ExpenseChart data={chartData} type="pie" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={<DollarSign className="h-12 w-12" />} title="Нет расходов" description="Добавьте первый расход" action={<Button onClick={() => navigate('/expenses/new')}><Plus className="h-4 w-4" />Добавить</Button>} />
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-3 transition-all hover:shadow-card dark:border-surface-700 dark:bg-surface-800">
              <div className={`rounded-lg p-2 ${categoryColors[e.category] || 'bg-surface-100'}`}>
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{categoryLabels[e.category]}</p>
                <p className="text-xs text-surface-500">{e.description || new Date(e.date).toLocaleDateString('ru')}</p>
              </div>
              <p className="font-semibold text-surface-900 dark:text-white">{Number(e.amount).toLocaleString('ru')} ₽</p>
              <button onClick={() => deleteExpense.mutate(e.id)} className="rounded-lg p-1.5 text-surface-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
