import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { clsx } from 'clsx'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DatePicker({ value, onChange, label, placeholder = 'Выбрать дату', className, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      return { year: y, month: m - 1 }
    }
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, close])

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      setViewDate({ year: y, month: m - 1 })
    }
  }, [value])

  const days = useMemo(() => {
    const { year, month } = viewDate
    const totalDays = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    return cells
  }, [viewDate])

  const prevMonth = () => {
    setViewDate(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 }
      return { year, month: month - 1 }
    })
  }

  const nextMonth = () => {
    setViewDate(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 }
      return { year, month: month + 1 }
    })
  }

  const selectDay = (day: number) => {
    const dateStr = formatDate(new Date(viewDate.year, viewDate.month, day))
    onChange(dateStr)
    close()
  }

  const today = new Date()
  const todayStr = formatDate(today)

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={clsx(
            'flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-all duration-150',
            'border-surface-200 hover:border-surface-300 hover:bg-surface-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'dark:border-surface-600 dark:bg-surface-800 dark:hover:border-surface-500 dark:hover:bg-surface-700',
            open && 'border-primary-500 ring-2 ring-primary-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            value ? 'text-surface-800 dark:text-surface-200' : 'text-surface-400 dark:text-surface-500'
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-surface-400" />
            <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
          </div>
          <ChevronDown className={clsx('h-4 w-4 shrink-0 text-surface-400 transition-transform duration-200', open && 'rotate-180')} />
        </button>

        {open && (
          <div
            className="absolute z-50 mt-1.5 w-72 rounded-xl border border-surface-200 bg-white p-3 shadow-lg dark:border-surface-600 dark:bg-surface-800"
            style={{ animation: 'fadeIn 0.15s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                {MONTHS[viewDate.month]} {viewDate.year}
              </span>
              <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
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
                const dateStr = formatDate(new Date(viewDate.year, viewDate.month, day))
                const isSelected = dateStr === value
                const isToday = dateStr === todayStr
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                      isSelected && 'bg-primary-500 text-white',
                      !isSelected && isToday && 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
                      !isSelected && !isToday && 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Today button */}
            <div className="mt-2 border-t border-surface-100 dark:border-surface-700 pt-2">
              <button
                type="button"
                onClick={() => { onChange(todayStr); close() }}
                className="w-full rounded-lg py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
              >
                Сегодня
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
