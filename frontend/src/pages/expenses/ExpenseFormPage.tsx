import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateExpense } from '../../hooks/useExpenses'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const categoryOptions = [
  { value: 'fuel', label: 'Топливо' }, { value: 'maintenance', label: 'ТО' },
  { value: 'repair', label: 'Ремонт' }, { value: 'insurance', label: 'Страховка' },
  { value: 'tax', label: 'Налог' }, { value: 'parking', label: 'Парковка' },
  { value: 'fine', label: 'Штраф' }, { value: 'wash', label: 'Мойка' },
  { value: 'tires', label: 'Шины' }, { value: 'other', label: 'Прочее' },
]

export default function ExpenseFormPage() {
  const navigate = useNavigate()
  const { data: carsData } = useCars()
  const createExpense = useCreateExpense()

  const cars = carsData?.data?.data || []
  const carOptions = cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` }))

  const [category, setCategory] = useState('fuel')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  const effectiveCarId = cars.length > 0 ? cars[0].id : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!effectiveCarId) { toast.error('Сначала добавьте автомобиль'); return }
    try {
      await createExpense.mutateAsync({ car_id: effectiveCarId, category: category as any, amount: Number(amount), date, description: description || undefined })
      toast.success('Расход добавлен')
      navigate('/expenses')
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Ошибка') }
  }

  return (
    <PageWrapper title="Добавить расход" backTo="/expenses">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Автомобиль *" options={carOptions} value={effectiveCarId} onChange={() => {}} disabled={carOptions.length <= 1} />
            <Select label="Категория" options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="Сумма (₽) *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Дата *" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Описание</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-white" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/expenses')}>Отмена</Button>
          <Button type="submit" loading={createExpense.isPending}>Сохранить</Button>
        </div>
      </form>
    </PageWrapper>
  )
}
