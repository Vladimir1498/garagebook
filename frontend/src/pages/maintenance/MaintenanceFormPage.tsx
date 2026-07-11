import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateMaintenance, useUpdateMaintenance, useMaintenance } from '../../hooks/useMaintenance'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Input from '../../components/ui/Input'
import DropdownSelect from '../../components/ui/DropdownSelect'
import DatePicker from '../../components/ui/DatePicker'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { getCurrencySymbol } from '../../utils/formatCurrency'

const typeOptions = [
  { value: 'oil_change', label: 'Замена масла' },
  { value: 'filter', label: 'Замена фильтра' },
  { value: 'spark_plugs', label: 'Свечи' },
  { value: 'brakes', label: 'Тормоза' },
  { value: 'suspension', label: 'Подвеска' },
  { value: 'timing_belt', label: 'ГРМ' },
  { value: 'engine_repair', label: 'Ремонт двигателя' },
  { value: 'custom', label: 'Другое' },
]

export default function MaintenanceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: carsData } = useCars()
  const { data: existingData, isLoading: loadingExisting } = useMaintenance(id || '')
  const createMaintenance = useCreateMaintenance()
  const updateMaintenance = useUpdateMaintenance()

  const cars = carsData?.data?.data || []
  const carOptions = cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))
  const existing = existingData?.data
  const isEditing = !!id

  const [carId, setCarId] = useState('')
  const [serviceType, setServiceType] = useState('oil_change')
  const [customType, setCustomType] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mileage, setMileage] = useState('')
  const [cost, setCost] = useState('')
  const [description, setDescription] = useState('')
  const [serviceCenter, setServiceCenter] = useState('')

  // Load existing record when editing
  useEffect(() => {
    if (existing) {
      setCarId(existing.car_id)
      setServiceType(existing.service_type)
      setCustomType(existing.custom_type || '')
      setDate(existing.date)
      setMileage(String(existing.mileage))
      setCost(String(existing.cost))
      setDescription(existing.description || '')
      setServiceCenter(existing.service_center || '')
    } else if (cars.length > 0 && !id) {
      setCarId(cars[0].id)
    }
  }, [existing, cars, id])

  if (id && loadingExisting) {
    return <PageWrapper title="Загрузка..." backTo="/maintenance"><Skeleton className="h-64" /></PageWrapper>
  }

  const effectiveCarId = carId || (cars.length > 0 ? cars[0].id : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!effectiveCarId) { toast.error('Сначала добавьте автомобиль'); return }
    if (!mileage || !cost) { toast.error('Заполните пробег и стоимость'); return }

    const payload = {
      car_id: effectiveCarId,
      service_type: serviceType as any,
      custom_type: customType || undefined,
      date,
      mileage: Number(mileage),
      cost: Number(cost),
      description: description || undefined,
      service_center: serviceCenter || undefined,
    }

    try {
      if (isEditing && id) {
        await updateMaintenance.mutateAsync({ id, data: payload })
        toast.success('Запись обновлена')
      } else {
        await createMaintenance.mutateAsync(payload)
        toast.success('Запись добавлена')
      }
      navigate('/maintenance')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ошибка')
    }
  }

  if (cars.length === 0) {
    return (
      <PageWrapper title={t('maintenance.add')} backTo="/maintenance">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center dark:border-surface-700 dark:bg-surface-800">
          <p className="text-surface-500">Сначала добавьте автомобиль</p>
          <Button className="mt-4" onClick={() => navigate('/cars/new')}>Добавить автомобиль</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={isEditing ? 'Редактировать запись' : t('maintenance.add')} backTo="/maintenance">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DropdownSelect label="Автомобиль" options={carOptions} value={effectiveCarId} onChange={setCarId} />
            <DropdownSelect label="Тип работ" options={typeOptions} value={serviceType} onChange={setServiceType} />
            {serviceType === 'custom' && <Input label="Тип (свой)" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Название работ" />}
            <DatePicker label="Дата *" value={date} onChange={setDate} />
            <Input label="Пробег (км) *" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} required placeholder="50000" />
            <Input label={`Стоимость (${getCurrencySymbol()}) *`} type="number" value={cost} onChange={(e) => setCost(e.target.value)} required placeholder="5000" />
            <Input label="Сервисный центр" value={serviceCenter} onChange={(e) => setServiceCenter(e.target.value)} placeholder="Название сервиса" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Описание</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white" placeholder="Подробности работ" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/maintenance')}>{t('common.cancel')}</Button>
          <Button type="submit" loading={createMaintenance.isPending || updateMaintenance.isPending}>{isEditing ? 'Сохранить' : t('common.save')}</Button>
        </div>
      </form>
    </PageWrapper>
  )
}
