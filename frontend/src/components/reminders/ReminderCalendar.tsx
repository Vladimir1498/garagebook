import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface Reminder {
  id: string
  title: string
  trigger_date: string | null
  is_completed: boolean
  reminder_type: string
}

interface ReminderCalendarProps {
  reminders: Reminder[]
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

export default function ReminderCalendar({ reminders }: ReminderCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  return (
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
          const hasOverdue = dayReminders.some(r => !r.is_completed)
          const hasCompleted = dayReminders.some(r => r.is_completed)

          return (
            <div
              key={day}
              className={clsx(
                'relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors min-h-[36px]',
                isToday && 'bg-primary-50 font-bold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
                !isToday && dayReminders.length > 0 && 'bg-surface-50 dark:bg-surface-700/50',
                !isToday && dayReminders.length === 0 && 'text-surface-600 dark:text-surface-400'
              )}
            >
              <span>{day}</span>
              {dayReminders.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayReminders.slice(0, 3).map((r, j) => (
                    <span
                      key={j}
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        r.is_completed ? 'bg-emerald-400' : 'bg-primary-500'
                      )}
                      title={r.title}
                    />
                  ))}
                  {dayReminders.length > 3 && (
                    <span className="text-[8px] text-surface-400">+{dayReminders.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-surface-400">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Активные</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Выполненные</span>
      </div>
    </div>
  )
}
