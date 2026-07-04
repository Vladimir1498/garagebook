import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Check, Plus, Trash2, Clock } from 'lucide-react'
import { useRemindersList, useCompleteReminder, useDeleteReminder, useCreateReminder } from '../../hooks/useReminders'
import { useCars } from '../../hooks/useCars'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import toast from 'react-hot-toast'

export default function RemindersPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useRemindersList()
  const { data: carsData } = useCars()
  const completeReminder = useCompleteReminder()
  const deleteReminder = useDeleteReminder()

  const reminders = data?.data?.data || []
  const cars = carsData?.data?.data || []
  const [showCreate, setShowCreate] = useState(false)

  return (
    <PageWrapper title={t('reminders.title')} action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />{t('reminders.add')}</Button>}>
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : reminders.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title="Нет напоминаний" description="Создайте первое напоминание" />
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const daysLeft = r.trigger_date ? Math.ceil((new Date(r.trigger_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
            const isUrgent = daysLeft !== null && daysLeft <= 30
            return (
              <div key={r.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-all dark:bg-surface-800 ${r.is_completed ? 'border-surface-200 bg-surface-50 opacity-60 dark:border-surface-700' : isUrgent ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : 'border-surface-200 bg-white dark:border-surface-700'}`}>
                <div className={`rounded-lg p-2 ${r.is_completed ? 'bg-surface-200 dark:bg-surface-600' : isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                  {r.is_completed ? <Check className="h-4 w-4 text-surface-500" /> : <Clock className="h-4 w-4 text-primary-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${r.is_completed ? 'text-surface-500 line-through' : 'text-surface-900 dark:text-white'}`}>{r.title}</p>
                  <p className="text-xs text-surface-500">{r.reminder_type === 'mileage' ? `через ${r.trigger_mileage} км` : r.trigger_date ? new Date(r.trigger_date).toLocaleDateString('ru') : ''}</p>
                </div>
                <div className="flex gap-1">
                  {!r.is_completed && <button onClick={() => completeReminder.mutate(r.id)} className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Check className="h-4 w-4" /></button>}
                  <button onClick={() => deleteReminder.mutate(r.id)} className="rounded-lg p-2 text-surface-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Новое напоминание">
        <ReminderForm cars={cars} onClose={() => setShowCreate(false)} />
      </Modal>
    </PageWrapper>
  )
}

function ReminderForm({ cars, onClose }: { cars: any[]; onClose: () => void }) {
  const { t } = useTranslation()
  const createReminder = useCreateReminder()
  const [title, setTitle] = useState('')
  const [carId, setCarId] = useState(cars[0]?.id || '')
  const [type, setType] = useState('date')
  const [triggerDate, setTriggerDate] = useState('')
  const [triggerMileage, setTriggerMileage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createReminder.mutateAsync({
        car_id: carId, title, reminder_type: type as any,
        trigger_date: type === 'date' ? triggerDate : undefined,
        trigger_mileage: type === 'mileage' ? Number(triggerMileage) : undefined,
      })
      toast.success('Напоминание создано')
      onClose()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Ошибка') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Замена масла" />
      <Select label="Автомобиль" options={cars.map((c: any) => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={carId} onChange={(e) => setCarId(e.target.value)} />
      <Select label="Тип" options={[{ value: 'date', label: 'По дате' }, { value: 'mileage', label: 'По пробегу' }]} value={type} onChange={(e) => setType(e.target.value)} />
      {type === 'date' && <Input label="Дата" type="date" value={triggerDate} onChange={(e) => setTriggerDate(e.target.value)} required />}
      {type === 'mileage' && <Input label="Пробег (км)" type="number" value={triggerMileage} onChange={(e) => setTriggerMileage(e.target.value)} required />}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit" loading={createReminder.isPending}>{t('common.save')}</Button>
      </div>
    </form>
  )
}
