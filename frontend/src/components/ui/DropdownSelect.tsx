import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

interface Option {
  value: string
  label: string
}

interface DropdownSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export default function DropdownSelect({ options, value, onChange, className, placeholder }: DropdownSelectProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label || placeholder || 'Выбрать'

  const close = useCallback(() => {
    setOpen(false)
    setHighlighted(-1)
  }, [])

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
    if (open && highlighted >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]')
      items[highlighted]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted, open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setHighlighted(options.findIndex((o) => o.value === value))
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted((h) => (h + 1) % options.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted((h) => (h - 1 + options.length) % options.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (highlighted >= 0) {
          onChange(options[highlighted].value)
          close()
        }
        break
      case 'Escape':
        close()
        break
    }
  }

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
          'border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
          'dark:border-surface-600 dark:bg-surface-800 dark:text-surface-200 dark:hover:border-surface-500 dark:hover:bg-surface-700',
          open && 'border-primary-500 ring-2 ring-primary-500/20'
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-surface-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-1 dark:border-surface-600 dark:bg-surface-800"
          style={{ animationDuration: '150ms' }}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value
            const isHighlighted = i === highlighted
            return (
              <button
                key={option.value}
                data-option
                type="button"
                onClick={() => { onChange(option.value); close() }}
                onMouseEnter={() => setHighlighted(i)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  isHighlighted && 'bg-primary-50 dark:bg-primary-950/30',
                  isSelected ? 'font-medium text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary-500" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
