import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Check, Clock, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

interface Reminder {
  id: string
  title: string
  trigger_date: string | null
  trigger_mileage: number | null
  is_completed: boolean
  reminder_type: string
}

interface ReminderCalendarProps {
  reminders: Reminder[]
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function ReminderCalendar({ reminders, onComplete, onDelete }: ReminderCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const remindersByDate = useMemo(() => {
    const map: Record<string, Reminder[]> = {}
    reminders.forEach((r) => {
      if (r.trigger_date) {
        const key = r.trigger_date.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key].push(r)
      }
    })
    return map
  }, [reminders])

  const days = useMemo(() => {
    const total = getDaysInMonth(viewYear, viewMonth)
    const first = getFirstDayOfMonth(viewYear, viewMonth)
    const cells: (number | null)[] = []
    for (let i = 0; i < first; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }, [viewYear, viewMonth])

  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedReminders = selectedDate ? remindersByDate[selectedDate] || [] : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  const formatSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('ru', { day: 'numeric', month: 'long', weekday: 'long' })
  }

  return (
    <div className="space-y-4">
      {/* Calendar card */}
      <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          <button onClick={nextMonth} className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 text-center text-[10px] font-medium text-surface-400">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const key = formatDateKey(viewYear, viewMonth, day)
            const dayReminders = remindersByDate[key] || []
            const isToday = key === todayKey
            const isSelected = key === selectedDate

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={clsx(
                  'relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-all min-h-[36px]',
                  isSelected && 'bg-primary-500 text-white font-bold ring-2 ring-primary-300 dark:ring-primary-700',
                  !isSelected && isToday && 'bg-primary-50 font-bold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
                  !isSelected && !isToday && dayReminders.length > 0 && 'bg-surface-50 hover:bg-surface-100 dark:bg-surface-700/50 dark:hover:bg-surface-600/50 cursor-pointer',
                  !isSelected && !isToday && dayReminders.length === 0 && 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/30'
                )}
              >
                <span>{day}</span>
                {dayReminders.length > 0 && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayReminders.slice(0, 3).map((r, j) => (
                      <span
                        key={j}
                        className={clsx('h-1.5 w-1.5 rounded-full', r.is_completed ? 'bg-emerald-400' : 'bg-primary-500')}
                        title={r.title}
                      />
                    ))}
                    {dayReminders.length > 3 && (
                      <span className="text-[8px] text-surface-400">+{dayReminders.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-surface-400">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Активные</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Выполненные</span>
        </div>
      </div>

      {/* Selected day reminders list */}
      {selectedDate && (
        <div className="rounded-2xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
              {formatSelectedDate(selectedDate)}
            </h4>
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-700 dark:text-surface-400">
              {selectedReminders.length}
            </span>
          </div>

          {selectedReminders.length === 0 ? (
            <p className="text-xs text-surface-400 text-center py-4">Нет напоминаний на этот день</p>
          ) : (
            <div className="space-y-1.5">
              {selectedReminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-700/50">
                  <div className={clsx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    r.is_completed ? 'bg-surface-200 dark:bg-surface-600' : 'bg-primary-50 dark:bg-primary-950/30'
                  )}>
                    {r.is_completed
                      ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                      : <Clock className="h-4 w-4 text-primary-500" strokeWidth={1.75} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={clsx('text-sm font-medium', r.is_completed ? 'text-surface-400 line-through' : 'text-surface-800 dark:text-surface-100')}>
                      {r.title}
                    </p>
                    <p className="text-[11px] text-surface-400">
                      {r.reminder_type === 'mileage' ? `${r.trigger_mileage?.toLocaleString('ru')} км` : 'По дате'}
                    </p>
                  </div>
                  {!r.is_completed && onComplete && (
                    <button onClick={() => onComplete(r.id)} className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors" title="Выполнено">
                      <Check className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(r.id)} className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors" title="Удалить">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
