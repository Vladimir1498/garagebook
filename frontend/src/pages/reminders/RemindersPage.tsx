import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Check, Plus, Trash2, Clock, CalendarClock, CalendarDays } from 'lucide-react'
import { useRemindersList, useCompleteReminder, useDeleteReminder, useCreateReminder } from '../../hooks/useReminders'
import { useCars } from '../../hooks/useCars'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import DropdownSelect from '../../components/ui/DropdownSelect'
import DatePicker from '../../components/ui/DatePicker'
import ReminderCalendar from '../../components/reminders/ReminderCalendar'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function RemindersPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useRemindersList()
  const { data: carsData } = useCars()
  const completeReminder = useCompleteReminder()
  const deleteReminder = useDeleteReminder()

  const reminders = data?.data?.data || []
  const cars = carsData?.data?.data || []
  const [showCreate, setShowCreate] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const overdue = reminders.filter(r => !r.is_completed && r.trigger_date && new Date(r.trigger_date) < new Date())
  const thisWeek = reminders.filter(r => !r.is_completed && r.trigger_date && (() => { const d = Math.ceil((new Date(r.trigger_date).getTime() - Date.now()) / 86400000); return d > 0 && d <= 7 })())
  const upcoming = reminders.filter(r => !r.is_completed && r.trigger_date && Math.ceil((new Date(r.trigger_date).getTime() - Date.now()) / 86400000) > 7)
  const completed = reminders.filter(r => r.is_completed)
  const other = reminders.filter(r => !r.is_completed && !r.trigger_date)

  const sections = [
    { title: 'Просроченные', items: overdue, color: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400', dot: 'bg-red-500' },
    { title: 'На этой неделе', items: thisWeek, color: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400', dot: 'bg-amber-500' },
    { title: 'Ближайшие', items: upcoming, color: 'bg-primary-50 text-primary-500 dark:bg-primary-950/30 dark:text-primary-400', dot: 'bg-primary-500' },
    { title: 'По пробегу', items: other, color: 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400', dot: 'bg-surface-400' },
    { title: 'Выполненные', items: completed, color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  ].filter(s => s.items.length > 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('reminders.title')}</h1>
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{reminders.length} напоминаний</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-surface-200 dark:border-surface-600">
            <button onClick={() => setView('list')} className={clsx('rounded-l-lg px-2.5 py-1.5 transition-colors', view === 'list' ? 'bg-primary-50 text-primary-500' : 'text-surface-400 hover:text-surface-600')}><Clock className="h-4 w-4" /></button>
            <button onClick={() => setView('calendar')} className={clsx('rounded-r-lg px-2.5 py-1.5 transition-colors', view === 'calendar' ? 'bg-primary-50 text-primary-500' : 'text-surface-400 hover:text-surface-600')}><CalendarDays className="h-4 w-4" /></button>
          </div>
          <Button onClick={() => setShowCreate(true)} iconLeft={<Plus />}>{t('reminders.add')}</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : reminders.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="Нет напоминаний" description="Создайте первое напоминание" action={<Button onClick={() => setShowCreate(true)} iconLeft={<Plus />}>Создать</Button>} />
      ) : view === 'calendar' ? (
        <ReminderCalendar reminders={reminders} />
      ) : (
        <div className="space-y-5">
          {sections.map(({ title, items, color, dot }) => (
            <div key={title}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                <span className={clsx('h-2 w-2 rounded-full', dot)} />
                {title}
                <span className="rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium dark:bg-surface-700">{items.length}</span>
              </h3>
              <div className="space-y-1.5">
                {items.map((r) => {
                  const daysLeft = r.trigger_date ? Math.ceil((new Date(r.trigger_date).getTime() - Date.now()) / 86400000) : null
                  return (
                    <div key={r.id} className="card flex items-center gap-3 p-3">
                      <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', r.is_completed ? 'bg-surface-100 dark:bg-surface-700' : color)}>
                        {r.is_completed ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={2} /> : <Clock className="h-4 w-4" strokeWidth={1.75} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={clsx('text-sm font-medium', r.is_completed ? 'text-surface-400 line-through' : 'text-surface-800 dark:text-surface-100')}>{r.title}</p>
                        <p className="text-xs text-surface-400">
                          {r.reminder_type === 'mileage' ? `${r.trigger_mileage?.toLocaleString('ru')} км` : r.trigger_date ? new Date(r.trigger_date).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) : ''}
                          {daysLeft !== null && !r.is_completed && <span className="ml-1 tabular-nums">{daysLeft > 0 ? `через ${daysLeft} дн.` : 'сегодня'}</span>}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {!r.is_completed && (
                          <button onClick={() => completeReminder.mutate(r.id)} className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30" title="Выполнено">
                            <Check className="h-4 w-4" strokeWidth={2} />
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Удалить напоминание?')) deleteReminder.mutate(r.id, { onSuccess: () => toast.success('Напоминание удалено') }) }} className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Удалить">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Новое напоминание">
        <ReminderForm cars={cars} onClose={() => setShowCreate(false)} />
      </Modal>
    </div>
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
    if (!title.trim()) { toast.error('Введите название'); return }
    if (!carId) { toast.error('Выберите автомобиль'); return }
    if (type === 'date' && !triggerDate) { toast.error('Выберите дату'); return }
    if (type === 'mileage' && !triggerMileage) { toast.error('Укажите пробег'); return }
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
      <DropdownSelect label="Автомобиль" options={cars.map((c: any) => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={carId} onChange={setCarId} />
      <DropdownSelect label="Тип" options={[{ value: 'date', label: 'По дате' }, { value: 'mileage', label: 'По пробегу' }]} value={type} onChange={setType} />
      {type === 'date' && <DatePicker label="Дата" value={triggerDate} onChange={setTriggerDate} />}
      {type === 'mileage' && <Input label="Пробег (км)" type="number" value={triggerMileage} onChange={(e) => setTriggerMileage(e.target.value)} required />}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>Отмена</Button>
        <Button type="submit" loading={createReminder.isPending}>Создать</Button>
      </div>
    </form>
  )
}
