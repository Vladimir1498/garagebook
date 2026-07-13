import { useForm, Controller } from 'react-hook-form'
import { useEffect } from 'react'
import type { Car, CarCreate } from '../../types/car.types'
import Input from '../ui/Input'
import DropdownSelect from '../ui/DropdownSelect'
import DatePicker from '../ui/DatePicker'
import Autocomplete from '../ui/Autocomplete'
import Button from '../ui/Button'
import VinScanner from '../ai/VinScanner'
import { POPULAR_BRANDS, POPULAR_MODELS } from '../../utils/constants'

const fuelOptions = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'electric', label: 'Электро' },
  { value: 'hybrid', label: 'Гибрид' },
]

const transmissionOptions = [
  { value: 'manual', label: 'Механика' },
  { value: 'automatic', label: 'Автомат' },
  { value: 'cvt', label: 'Вариатор' },
  { value: 'robotic', label: 'Робот' },
]

interface CarFormProps {
  initialData?: Car
  onSubmit: (data: CarCreate) => void
  isLoading?: boolean
}

export default function CarForm({ initialData, onSubmit, isLoading }: CarFormProps) {
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<CarCreate>({
    defaultValues: initialData ? {
      brand: initialData.brand,
      model: initialData.model,
      year: initialData.year,
      vin: initialData.vin || '',
      license_plate: initialData.license_plate || '',
      fuel_type: initialData.fuel_type,
      engine_volume: initialData.engine_volume || undefined,
      transmission: initialData.transmission,
      color: initialData.color || '',
      mileage: initialData.mileage,
      purchase_date: initialData.purchase_date || '',
      insurance_expiry: initialData.insurance_expiry || '',
      inspection_expiry: initialData.inspection_expiry || '',
    } : { fuel_type: 'petrol', transmission: 'automatic', mileage: 0, year: new Date().getFullYear() }
  })

  const selectedBrand = watch('brand')
  const availableModels = POPULAR_MODELS[selectedBrand] || []

  useEffect(() => {
    if (initialData) {
      reset({
        brand: initialData.brand,
        model: initialData.model,
        year: initialData.year,
        vin: initialData.vin ?? '',
        license_plate: initialData.license_plate ?? '',
        fuel_type: initialData.fuel_type,
        engine_volume: initialData.engine_volume ?? undefined,
        transmission: initialData.transmission,
        color: initialData.color ?? '',
        mileage: initialData.mileage,
        purchase_date: initialData.purchase_date ?? '',
        insurance_expiry: initialData.insurance_expiry ?? '',
        inspection_expiry: initialData.inspection_expiry ?? '',
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
        <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">Основная информация</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="brand"
            control={control}
            rules={{ required: 'Обязательное поле' }}
            render={({ field }) => (
              <Autocomplete
                label="Марка *"
                value={field.value || ''}
                onChange={field.onChange}
                options={POPULAR_BRANDS}
                placeholder="Начните вводить..."
                error={errors.brand?.message}
              />
            )}
          />
          <Controller
            name="model"
            control={control}
            rules={{ required: 'Обязательное поле' }}
            render={({ field }) => (
              <Autocomplete
                label="Модель *"
                value={field.value || ''}
                onChange={field.onChange}
                options={availableModels}
                placeholder={selectedBrand ? `Модели ${selectedBrand}` : 'Сначала выберите марку'}
                error={errors.model?.message}
              />
            )}
          />
          <Input label="Год *" type="number" error={errors.year?.message} {...register('year', { required: 'Обязательное поле', min: 1900, max: new Date().getFullYear() + 1 })} />
          <div>
            <Input label="VIN" {...register('vin')} placeholder="17 символов" maxLength={17} />
            <div className="mt-1.5">
              <VinScanner onScan={(vin) => setValue('vin', vin)} />
            </div>
          </div>
          <Input label="Госномер" {...register('license_plate')} placeholder="А123БВ777" />
          <Controller
            name="fuel_type"
            control={control}
            render={({ field }) => (
              <DropdownSelect label="Топливо" options={fuelOptions} value={field.value} onChange={field.onChange} />
            )}
          />
          <Input label="Объем двигателя" type="number" step="0.1" {...register('engine_volume')} placeholder="2.0" />
          <Controller
            name="transmission"
            control={control}
            render={({ field }) => (
              <DropdownSelect label="Коробка передач" options={transmissionOptions} value={field.value} onChange={field.onChange} />
            )}
          />
          <Input label="Цвет" {...register('color')} placeholder="Белый" />
          <Input label="Пробег (км)" type="number" {...register('mileage', { min: 0 })} />
          <Controller
            name="purchase_date"
            control={control}
            render={({ field }) => (
              <DatePicker label="Дата покупки" value={field.value || ''} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
        <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">Документы</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="insurance_expiry"
            control={control}
            render={({ field }) => (
              <DatePicker label="Страховка до" value={field.value || ''} onChange={field.onChange} />
            )}
          />
          <Controller
            name="inspection_expiry"
            control={control}
            render={({ field }) => (
              <DatePicker label="Техосмотр до" value={field.value || ''} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={isLoading}>{initialData ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  )
}
