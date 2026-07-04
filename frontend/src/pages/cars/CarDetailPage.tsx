import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCar, useDeleteCar, useUploadCarPhoto } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import CarPhotoGallery from '../../components/cars/CarPhotoGallery'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }
const transLabels: Record<string, string> = { manual: 'Механика', automatic: 'Автомат', cvt: 'Вариатор', robotic: 'Робот' }

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useCar(id!)
  const deleteCar = useDeleteCar()
  const uploadPhoto = useUploadCarPhoto()
  const [showDelete, setShowDelete] = useState(false)

  const car = data?.data

  if (isLoading) return <Skeleton className="h-96" />
  if (!car) return null

  const handleDelete = async () => {
    await deleteCar.mutateAsync(id!)
    toast.success('Автомобиль удален')
    navigate('/cars')
  }

  return (
    <PageWrapper title={`${car.brand} ${car.model}`} backTo="/cars">
      <CarPhotoGallery photoUrl={car.photo_url} onUpload={(file) => uploadPhoto.mutate({ id: id!, file })} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label={t('cars.year')} value={String(car.year)} />
        <InfoItem label={t('cars.vin')} value={car.vin || '—'} />
        <InfoItem label={t('cars.license_plate')} value={car.license_plate || '—'} />
        <InfoItem label={t('cars.fuel_type')} value={fuelLabels[car.fuel_type]} />
        <InfoItem label={t('cars.engine_volume')} value={car.engine_volume ? `${car.engine_volume} л` : '—'} />
        <InfoItem label={t('cars.transmission')} value={transLabels[car.transmission]} />
        <InfoItem label={t('cars.color')} value={car.color || '—'} />
        <InfoItem label={t('cars.mileage')} value={`${car.mileage.toLocaleString('ru')} км`} />
        <InfoItem label={t('cars.purchase_date')} value={car.purchase_date ? new Date(car.purchase_date).toLocaleDateString('ru') : '—'} />
        <InfoItem label={t('cars.insurance_expiry')} value={car.insurance_expiry ? new Date(car.insurance_expiry).toLocaleDateString('ru') : '—'} />
        <InfoItem label={t('cars.inspection_expiry')} value={car.inspection_expiry ? new Date(car.inspection_expiry).toLocaleDateString('ru') : '—'} />
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => navigate(`/cars/${id}/edit`)}>{t('cars.edit')}</Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}>{t('common.delete')}</Button>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Удалить автомобиль?" size="sm">
        <p className="text-sm text-surface-600">Это действие нельзя отменить. Все данные будут удалены.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteCar.isPending}>{t('common.delete')}</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
      <p className="text-xs font-medium text-surface-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-white">{value}</p>
    </div>
  )
}
