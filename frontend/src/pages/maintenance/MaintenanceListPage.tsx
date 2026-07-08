import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Wrench, Trash2, Edit, Search } from 'lucide-react'
import { useMaintenanceList, useDeleteMaintenance } from '../../hooks/useMaintenance'
import { useCars } from '../../hooks/useCars'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { formatMoney } from '../../utils/formatCurrency'

const typeLabels: Record<string, string> = {
  oil_change: 'Замена масла', filter: 'Замена фильтра', spark_plugs: 'Свечи',
  brakes: 'Тормоза', suspension: 'Подвеска', timing_belt: 'ГРМ',
  engine_repair: 'Двигатель', custom: 'Другое',
}

const typeColors: Record<string, string> = {
  oil_change: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
  filter: 'bg-cyan-50 text-cyan-500 dark:bg-cyan-950/30 dark:text-cyan-400',
  spark_plugs: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400',
  brakes: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
  suspension: 'bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400',
  timing_belt: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
  engine_repair: 'bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400',
  custom: 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
}

export default function MaintenanceListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useMaintenanceList()
  const { data: carsData } = useCars()
  const deleteMaintenance = useDeleteMaintenance()
  const records = data?.data?.data || []
  const cars = carsData?.data?.data || []
  const carMap = Object.fromEntries(cars.map((c) => [c.id, `${c.brand} ${c.model}`]))
  const [search, setSearch] = useState('')

  const filtered = search
    ? records.filter(r => `${typeLabels[r.service_type] || r.service_type} ${carMap[r.car_id] || ''}`.toLowerCase().includes(search.toLowerCase()))
    : records

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('maintenance.title')}</h1>
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{records.length} записей</p>
        </div>
        <Button onClick={() => navigate('/maintenance/new')} iconLeft={<Plus />}>{t('maintenance.add')}</Button>
      </div>

      {records.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-7 w-7" />}
          title={search ? 'Ничего не найдено' : 'Нет записей'}
          description={search ? 'Попробуйте другой запрос' : 'Добавьте первую запись обслуживания'}
          action={!search ? <Button onClick={() => navigate('/maintenance/new')} iconLeft={<Plus />}>Добавить</Button> : undefined}
        />
      ) : (
        <div className="space-y-2 page-enter-stagger">
          {filtered.map((r) => (
            <div key={r.id} className="card flex items-center gap-3 p-3 sm:p-4">
              <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', typeColors[r.service_type] || typeColors.custom)}>
                <Wrench className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{typeLabels[r.service_type] || r.custom_type || r.service_type}</p>
                <p className="text-xs text-surface-400">{carMap[r.car_id] || 'Авто'} · {new Date(r.date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-surface-800 dark:text-white">{formatMoney(Number(r.cost))}</p>
                  <p className="text-[10px] text-surface-400">{r.mileage.toLocaleString('ru')} км</p>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => navigate(`/maintenance/${r.id}/edit`)} className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm('Удалить запись?')) deleteMaintenance.mutate(r.id, { onSuccess: () => toast.success('Запись удалена') }) }} className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
