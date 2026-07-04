import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface AutocompleteProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  error?: string
}

export default function Autocomplete({ label, value, onChange, options, placeholder, error }: AutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase())).slice(0, 10)

  const select = (val: string) => {
    onChange(val)
    setQuery(val)
    setOpen(false)
    setHighlighted(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(filtered[highlighted]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setHighlighted(-1) }}
          onKeyDown={handleKeyDown}
          className={clsx(
            'w-full rounded-xl border border-surface-200 bg-white px-4 py-3 pr-10 text-sm text-surface-900 placeholder-surface-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          )}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        {open && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-surface-200 bg-white shadow-soft-lg dark:border-surface-600 dark:bg-surface-800">
            {filtered.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => select(opt)}
                onMouseEnter={() => setHighlighted(i)}
                className={clsx(
                  'flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors',
                  i === highlighted ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
