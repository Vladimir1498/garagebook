import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, Lock } from 'lucide-react'
import { useCars } from '../../hooks/useCars'
import { useSubscription } from '../../hooks/useSubscription'
import PageWrapper from '../../components/layout/PageWrapper'
import CarCard from '../../components/cars/CarCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'

export default function CarsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useCars()
  const { data: subData } = useSubscription()
  const [showLimitModal, setShowLimitModal] = useState(false)

  const cars = data?.data?.data || []
  const tier = subData?.data?.tier || 'free'
  const canAddMore = tier !== 'free' || cars.length < 1

  const handleAddCar = () => {
    if (!canAddMore) {
      setShowLimitModal(true)
      return
    }
    navigate('/cars/new')
  }

  return (
    <PageWrapper
      title={t('cars.title')}
      action={
        <Button onClick={handleAddCar}>
          <Plus className="h-4 w-4" />{t('cars.add')}
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<Car className="h-12 w-12" />}
          title={t('cars.empty')}
          description={t('cars.empty_desc')}
          action={<Button onClick={handleAddCar}><Plus className="h-4 w-4" />{t('cars.add')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      )}

      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Лимит тарифа" size="sm">
        <div className="text-center py-4">
          <Lock className="mx-auto h-10 w-10 text-primary-500 mb-3" />
          <p className="text-surface-600">На бесплатном тарифе можно добавить только 1 автомобиль.</p>
          <p className="mt-1 text-sm text-surface-500">Обновите тариф для неограниченного количества.</p>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowLimitModal(false)}>Закрыть</Button>
          <Button onClick={() => { setShowLimitModal(false); navigate('/pricing') }}>Обновить тариф</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
