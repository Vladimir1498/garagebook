import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Car } from 'lucide-react'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import CarCard from '../../components/cars/CarCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'

export default function CarsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useCars()
  const cars = data?.data?.data || []

  return (
    <PageWrapper
      title={t('cars.title')}
      action={<Button onClick={() => navigate('/cars/new')}><Plus className="h-4 w-4" />{t('cars.add')}</Button>}
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
          action={<Button onClick={() => navigate('/cars/new')}><Plus className="h-4 w-4" />{t('cars.add')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      )}
    </PageWrapper>
  )
}
