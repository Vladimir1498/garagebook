import { useParams, useNavigate } from 'react-router-dom'
import { useCar, useCreateCar, useUpdateCar } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import CarForm from '../../components/cars/CarForm'
import toast from 'react-hot-toast'
import type { CarCreate } from '../../types/car.types'

export default function CarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useCar(id || '')
  const createCar = useCreateCar()
  const updateCar = useUpdateCar()

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
      toast.error(err.response?.data?.detail || 'Ошибка')
    }
  }

  return (
    <PageWrapper title={isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'} backTo="/cars">
      <CarForm initialData={car} onSubmit={handleSubmit} isLoading={createCar.isPending || updateCar.isPending} />
    </PageWrapper>
  )
}
