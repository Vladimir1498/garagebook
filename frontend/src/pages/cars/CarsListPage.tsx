import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, Lock, Search } from 'lucide-react'
import { useCars } from '../../hooks/useCars'
import { useSubscription } from '../../hooks/useSubscription'
import PageWrapper from '../../components/layout/PageWrapper'
import CarCard from '../../components/cars/CarCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import { clsx } from 'clsx'

export default function CarsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useCars()
  const { data: subData } = useSubscription()
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [search, setSearch] = useState('')

  const cars = data?.data?.data || []
  const tier = subData?.data?.tier || 'free'
  const canAddMore = tier !== 'free' || cars.length < 1

  const filtered = search
    ? cars.filter(c => `${c.brand} ${c.model} ${c.year}`.toLowerCase().includes(search.toLowerCase()))
    : cars

  const handleAddCar = () => {
    if (!canAddMore) { setShowLimitModal(true); return }
    navigate('/cars/new')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('cars.title')}</h1>
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{cars.length} {t('cars.title').toLowerCase()}</p>
        </div>
        <Button onClick={handleAddCar} iconLeft={<Plus />}>
          {t('cars.add')}
        </Button>
      </div>

      {/* Search */}
      {cars.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={`${t('common.search')}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title={search ? 'Ничего не найдено' : t('cars.empty')}
          description={search ? 'Попробуйте другой запрос' : t('cars.empty_desc')}
          action={!search ? <Button onClick={handleAddCar} iconLeft={<Plus />}>{t('cars.add')}</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 page-enter-stagger">
          {filtered.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      )}

      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Лимит тарифа" size="sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/30">
            <Lock className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-300">На бесплатном тарифе можно добавить только 1 автомобиль.</p>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Обновите тариф для неограниченного количества.</p>
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="ghost" onClick={() => setShowLimitModal(false)}>Закрыть</Button>
          <Button onClick={() => { setShowLimitModal(false); navigate('/pricing') }}>Обновить тариф</Button>
        </div>
      </Modal>
    </div>
  )
}
