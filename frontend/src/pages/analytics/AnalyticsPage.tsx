import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, DollarSign, Gauge } from 'lucide-react'
import { analyticsService } from '../../services/analytics.service'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Select from '../../components/ui/Select'
import StatCard from '../../components/dashboard/StatCard'
import ExpenseChart from '../../components/charts/ExpenseChart'
import Skeleton from '../../components/ui/Skeleton'

const categoryLabels: Record<string, string> = {
  fuel: 'Топливо', maintenance: 'ТО', repair: 'Ремонт', insurance: 'Страховка',
  tax: 'Налог', parking: 'Парковка', fine: 'Штраф', wash: 'Мойка', tires: 'Шины', other: 'Прочее',
}

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Замена масла', filter: 'Замена фильтра', spark_plugs: 'Свечи',
  brakes: 'Тормоза', suspension: 'Подвеска', timing_belt: 'ГРМ',
  engine_repair: 'Двигатель', custom: 'Другое',
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { data: carsData } = useCars()
  const cars = carsData?.data?.data || []
  const [selectedCar, setSelectedCar] = useState('')
  const [period, setPeriod] = useState('year')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', selectedCar, period],
    queryFn: () => analyticsService.get(selectedCar || undefined, period),
  })

  const d = data?.data
  const carOptions = [{ value: '', label: 'Все автомобили' }, ...cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))]
  const periodOptions = [{ value: 'month', label: 'За месяц' }, { value: 'year', label: 'За год' }, { value: 'all', label: 'За всё время' }]

  const totalExpenses = Number(d?.total_expenses || 0)
  const avgService = Number(d?.avg_service_cost || 0)
  const costPerKm = Number(d?.cost_per_km || 0)
  const ownershipCost = Number(d?.ownership_cost || 0)

  const categoryBreakdown = (d?.category_breakdown || []).map((c) => ({
    category: categoryLabels[c.category] || c.category,
    total: Number(c.total),
    count: c.count,
  }))

  const monthlyData = (d?.monthly_expenses || []).map((m) => ({
    category: m.month,
    total: Number(m.total),
    count: 0,
  }))

  return (
    <PageWrapper title={t('analytics.title')}>
      <div className="mb-6 flex flex-wrap gap-3">
        <Select options={carOptions} value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} className="w-48" />
        <Select options={periodOptions} value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" />
      </div>

      {isLoading ? (
        <div className="space-y-6"><Skeleton className="h-28" /><Skeleton className="h-72" /></div>
      ) : d ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t('analytics.total_expenses')} value={`${totalExpenses.toLocaleString('ru')} ₽`} icon={<DollarSign className="h-5 w-5" />} />
            <StatCard title={t('analytics.avg_service')} value={`${avgService.toLocaleString('ru')} ₽`} icon={<BarChart3 className="h-5 w-5" />} />
            <StatCard title={t('analytics.cost_per_km')} value={`${costPerKm.toFixed(2)} ₽/км`} icon={<Gauge className="h-5 w-5" />} />
            <StatCard title={t('analytics.ownership_cost')} value={`${ownershipCost.toLocaleString('ru')} ₽`} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          {categoryBreakdown.length > 0 && (
            <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Расходы по категориям</h3>
              <ExpenseChart data={categoryBreakdown} type="pie" />
            </div>
          )}

          {monthlyData.length > 0 && (
            <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Динамика расходов</h3>
              <ExpenseChart data={monthlyData} type="bar" />
            </div>
          )}

          {d.most_expensive_repair && (
            <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-2 text-sm font-semibold text-surface-900 dark:text-white">Самая дорогая поломка</h3>
              <p className="text-sm text-surface-600">{serviceTypeLabels[d.most_expensive_repair.description] || d.most_expensive_repair.description} — <span className="font-semibold">{Number(d.most_expensive_repair.cost).toLocaleString('ru')} ₽</span></p>
              <p className="text-xs text-surface-400">{new Date(d.most_expensive_repair.date).toLocaleDateString('ru')}</p>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-surface-500">
          <BarChart3 className="mx-auto h-12 w-12 text-surface-300" />
          <p className="mt-4">Добавьте расходы и обслуживание для отображения аналитики</p>
        </div>
      )}
    </PageWrapper>
  )
}
