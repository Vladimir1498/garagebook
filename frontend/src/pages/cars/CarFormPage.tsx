import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCar, useCreateCar, useUpdateCar } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import CarForm from '../../components/cars/CarForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import type { CarCreate } from '../../types/car.types'
import { Lock } from 'lucide-react'

export default function CarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useCar(id || '')
  const createCar = useCreateCar()
  const updateCar = useUpdateCar()
  const [showTierModal, setShowTierModal] = useState(false)

  const isEdit = !!id
  const car = data?.data

  const handleSubmit = async (formData: CarCreate) => {
    try {
      if (isEdit && car) {
        await updateCar.mutateAsync({ id, data: formData })
        toast.success('Автомобиль обновлен')
      } else {
        await createCar.mutateAsync(formData)
        toast.success('Автомобиль добавлен')
      }
      navigate('/cars')
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowTierModal(true)
      } else {
        toast.error(err.response?.data?.detail || 'Ошибка')
      }
    }
  }

  return (
    <PageWrapper title={isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'} backTo="/cars">
      <CarForm initialData={car} onSubmit={handleSubmit} isLoading={createCar.isPending || updateCar.isPending} />

      <Modal isOpen={showTierModal} onClose={() => setShowTierModal(false)} title="Лимит тарифа" size="sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/30">
            <Lock className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-300">На бесплатном тарифе можно добавить только 1 автомобиль.</p>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Обновите тариф для неограниченного количества.</p>
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="ghost" onClick={() => setShowTierModal(false)}>Закрыть</Button>
          <Button onClick={() => navigate('/pricing')}>Обновить тариф</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
