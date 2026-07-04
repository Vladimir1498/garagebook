import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Wrench, Trash2, Edit } from 'lucide-react'
import { useMaintenanceList, useDeleteMaintenance } from '../../hooks/useMaintenance'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const typeLabels: Record<string, string> = {
  oil_change: 'Замена масла', filter: 'Замена фильтра', spark_plugs: 'Свечи',
  brakes: 'Тормоза', suspension: 'Подвеска', timing_belt: 'ГРМ',
  engine_repair: 'Двигатель', custom: 'Другое',
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

  const handleDelete = async (id: string) => {
    await deleteMaintenance.mutateAsync(id)
    toast.success('Запись удалена')
  }

  return (
    <PageWrapper title={t('maintenance.title')} action={<Button onClick={() => navigate('/maintenance/new')}><Plus className="h-4 w-4" />{t('maintenance.add')}</Button>}>
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : records.length === 0 ? (
        <EmptyState icon={<Wrench className="h-12 w-12" />} title="Нет записей" description="Добавьте первую запись обслуживания" action={<Button onClick={() => navigate('/maintenance/new')}><Plus className="h-4 w-4" />Добавить</Button>} />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-surface-200 bg-white p-4 shadow-card transition-all hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-800">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-500 dark:bg-blue-900/20"><Wrench className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-white">{typeLabels[r.service_type] || r.custom_type || r.service_type}</p>
                <p className="text-sm text-surface-500">{carMap[r.car_id] || 'Авто'} · {new Date(r.date).toLocaleDateString('ru')}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-surface-900 dark:text-white">{Number(r.cost).toLocaleString('ru')} ₽</p>
                <p className="text-xs text-surface-400">{r.mileage.toLocaleString('ru')} км</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => navigate(`/maintenance/${r.id}/edit`)} className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(r.id)} className="rounded-lg p-2 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
