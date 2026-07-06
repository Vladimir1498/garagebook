import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCar, useDeleteCar, useUploadCarPhoto } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import CarPhotoGallery from '../../components/cars/CarPhotoGallery'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { ArrowLeft, Calendar, Edit, Fuel, Gauge, Shield, Trash2, Wrench, FileText, DollarSign, Plus } from 'lucide-react'
import { resolveFileUrl } from '../../utils/resolveFileUrl'
import Tabs from '../../components/ui/Tabs'
import EmptyState from '../../components/ui/EmptyState'
import { useRemindersList } from '../../hooks/useReminders'
import { useExpensesList } from '../../hooks/useExpenses'
import { useMaintenanceList } from '../../hooks/useMaintenance'

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }
const transLabels: Record<string, string> = { manual: 'Механика', automatic: 'Автомат', cvt: 'Вариатор', robotic: 'Робот' }

const tabs = [
  { id: 'overview', label: 'Обзор' },
  { id: 'maintenance', label: 'Обслуживание' },
  { id: 'documents', label: 'Документы' },
  { id: 'expenses', label: 'Расходы' },
  { id: 'reminders', label: 'Напоминания' },
]

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useCar(id!)
  const deleteCar = useDeleteCar()
  const uploadPhoto = useUploadCarPhoto()
  const [showDelete, setShowDelete] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const car = data?.data

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-48" /></div>
  if (!car) return null

  const photoUrl = resolveFileUrl(car.photo_url)

  const infoItems = [
    { label: 'Год', value: String(car.year) },
    { label: 'VIN', value: car.vin || '—' },
    { label: 'Гос. номер', value: car.license_plate || '—' },
    { label: 'Топливо', value: fuelLabels[car.fuel_type] },
    { label: 'Двигатель', value: car.engine_volume ? `${car.engine_volume} л` : '—' },
    { label: 'КПП', value: transLabels[car.transmission] },
    { label: 'Цвет', value: car.color || '—' },
    { label: 'Пробег', value: `${car.mileage.toLocaleString('ru')} км` },
    { label: 'Дата покупки', value: car.purchase_date ? new Date(car.purchase_date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
  ]

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/cars')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-400 transition-colors hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Автомобили
      </button>

      {/* Hero */}
      <div className="card-interactive overflow-hidden">
        {photoUrl && (
          <div className="relative -mx-5 -mt-5 mb-5 aspect-[21/9] overflow-hidden sm:-mx-5 sm:-mt-5 sm:mb-5">
            <img src={photoUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">{car.brand} {car.model}</h1>
              <p className="mt-1 text-sm text-white/80">{car.year} · {car.mileage.toLocaleString('ru')} км</p>
            </div>
          </div>
        )}

        {!photoUrl && (
          <div className="mb-4 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">{car.brand} {car.model}</h1>
          </div>
        )}

        <CarPhotoGallery photoUrl={car.photo_url} onUpload={(file) => uploadPhoto.mutate({ id: id!, file })} />

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">Пробег</p>
            <p className="mt-0.5 text-sm font-semibold text-surface-900 tabular-nums dark:text-white">{car.mileage.toLocaleString('ru')} км</p>
          </div>
          <div className="rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">Топливо</p>
            <p className="mt-0.5 text-sm font-semibold text-surface-900 dark:text-white">{fuelLabels[car.fuel_type]}</p>
          </div>
          <div className="rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">КПП</p>
            <p className="mt-0.5 text-sm font-semibold text-surface-900 dark:text-white">{transLabels[car.transmission]}</p>
          </div>
          {car.insurance_expiry && (
            <div className="rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
              <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">Страховка</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant={Math.ceil((new Date(car.insurance_expiry).getTime() - Date.now()) / 86400000) <= 30 ? 'warning' : 'default'} size="sm">
                  {new Date(car.insurance_expiry).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="page-enter">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {infoItems.map(({ label, value }) => (
              <div key={label} className="card p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-surface-800 dark:text-surface-100">{value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'expenses' && (
          <CarExpensesTab carId={id!} />
        )}

        {activeTab === 'reminders' && (
          <CarRemindersTab carId={id!} />
        )}

        {activeTab === 'maintenance' && (
          <CarMaintenanceTab carId={id!} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-surface-100 pt-4 dark:border-surface-700/50">
        <Button variant="ghost" onClick={() => navigate(`/cars/${id}/edit`)} iconLeft={<Edit />}>
          Редактировать
        </Button>
        <Button variant="ghost" onClick={() => setShowDelete(true)} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" iconLeft={<Trash2 />}>
          Удалить
        </Button>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Удалить автомобиль?" size="sm">
        <p className="text-sm text-surface-500">Это действие нельзя отменить. Все данные будут удалены.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Отмена</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteCar.isPending}>Удалить</Button>
        </div>
      </Modal>
    </div>
  )

  async function handleDelete() {
    await deleteCar.mutateAsync(id!)
    toast.success('Автомобиль удален')
    navigate('/cars')
  }
}

function CarExpensesTab({ carId }: { carId: string }) {
  const { data } = useExpensesList({ car_id: carId })
  const expenses = data?.data?.data || []

  if (!expenses.length) {
    return <EmptyState icon={<DollarSign className="h-7 w-7" />} title="Нет расходов" description="Добавьте первый расход" action={<Button onClick={() => window.location.href = '/expenses/new'} iconLeft={<Plus />}>Добавить</Button>} />
  }

  return (
    <div className="space-y-2">
      {expenses.map((e) => (
        <div key={e.id} className="card flex items-center gap-3 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{e.description || e.category}</p>
            <p className="text-xs text-surface-400">{e.category} · {new Date(e.date).toLocaleDateString('ru')}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-surface-800 dark:text-white">{e.amount.toLocaleString('ru')} ₽</p>
        </div>
      ))}
    </div>
  )
}

function CarRemindersTab({ carId }: { carId: string }) {
  const { data } = useRemindersList({ car_id: carId })
  const reminders = data?.data?.data || []

  if (!reminders.length) {
    return <EmptyState icon={<Calendar className="h-7 w-7" />} title="Нет напоминаний" description="Добавьте напоминание" />
  }

  return (
    <div className="space-y-2">
      {reminders.map((r) => (
        <div key={r.id} className="card flex items-center gap-3 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-950/30 dark:text-primary-400">
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{r.title}</p>
            <p className="text-xs text-surface-400">{r.trigger_date ? new Date(r.trigger_date).toLocaleDateString('ru') : `${r.trigger_mileage} км`}</p>
          </div>
          {r.is_completed && <Badge variant="success" size="sm">Готово</Badge>}
        </div>
      ))}
    </div>
  )
}

function CarMaintenanceTab({ carId }: { carId: string }) {
  const { data } = useMaintenanceList({ car_id: carId })
  const records = data?.data?.data || []

  if (!records.length) {
    return <EmptyState icon={<Wrench className="h-7 w-7" />} title="Нет записей" description="Добавьте первую запись обслуживания" />
  }

  return (
    <div className="space-y-2">
      {records.map((r) => (
        <div key={r.id} className="card flex items-center gap-3 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
            <Wrench className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{r.service_type}</p>
            <p className="text-xs text-surface-400">{new Date(r.date).toLocaleDateString('ru')} · {r.mileage?.toLocaleString('ru')} км</p>
          </div>
          {r.cost > 0 && <p className="shrink-0 text-sm font-semibold tabular-nums text-surface-800 dark:text-white">{r.cost.toLocaleString('ru')} ₽</p>}
        </div>
      ))}
    </div>
  )
}
