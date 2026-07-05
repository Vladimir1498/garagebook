import { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Car, Wrench, DollarSign, FileText, Bell, BarChart3, Settings, LogOut, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CommandPaletteContext } from '../../contexts/CommandPaletteContext'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const navCommands = [
  { id: 'dashboard', label: 'nav.dashboard', icon: BarChart3, path: '/' },
  { id: 'cars', label: 'nav.cars', icon: Car, path: '/cars' },
  { id: 'maintenance', label: 'nav.maintenance', icon: Wrench, path: '/maintenance' },
  { id: 'expenses', label: 'nav.expenses', icon: DollarSign, path: '/expenses' },
  { id: 'documents', label: 'nav.documents', icon: FileText, path: '/documents' },
  { id: 'reminders', label: 'nav.reminders', icon: Bell, path: '/reminders' },
  { id: 'analytics', label: 'nav.analytics', icon: BarChart3, path: '/analytics' },
  { id: 'settings', label: 'nav.settings', icon: Settings, path: '/settings' },
  { id: 'add-car', label: 'cars.add', icon: Car, path: '/cars/new' },
  { id: 'add-maintenance', label: 'maintenance.add', icon: Wrench, path: '/maintenance/new' },
  { id: 'add-expense', label: 'expenses.add', icon: DollarSign, path: '/expenses/new' },
]

interface SearchResult {
  id: string
  type: string
  title: string
  subtitle: string
  path: string
}

export default function CommandPalette() {
  const { isOpen, close } = useContext(CommandPaletteContext)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredNav = navCommands.filter((c) =>
    t(c.label).toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase())
  )

  const allResults: SearchResult[] = [
    ...filteredNav.map((c) => ({ id: c.id, type: 'nav', title: t(c.label), subtitle: '', path: c.path })),
    ...searchResults,
  ]

  const runCommand = useCallback((item: SearchResult) => {
    close()
    setQuery('')
    setSearchResults([])
    navigate(item.path)
  }, [close, navigate])

  useEffect(() => { setSelectedIdx(0) }, [query, searchResults])

  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get(`/api/v1/search?q=${encodeURIComponent(query)}`)
        const data = response.data
        const results: SearchResult[] = []

        if (data.cars) {
          data.cars.forEach((car: any) => {
            results.push({
              id: `car-${car.id}`,
              type: 'car',
              title: `${car.brand} ${car.model} (${car.year})`,
              subtitle: car.license_plate || car.vin || '',
              path: `/cars/${car.id}`,
            })
          })
        }

        if (data.maintenance) {
          data.maintenance.forEach((m: any) => {
            results.push({
              id: `maint-${m.id}`,
              type: 'maintenance',
              title: `${m.service_type} — ${m.description || ''}`,
              subtitle: `${m.date} • ${m.cost} ₽`,
              path: `/maintenance/${m.id}`,
            })
          })
        }

        if (data.expenses) {
          data.expenses.forEach((e: any) => {
            results.push({
              id: `exp-${e.id}`,
              type: 'expense',
              title: `${e.category} — ${e.description || ''}`,
              subtitle: `${e.date} • ${e.amount} ₽`,
              path: `/expenses/${e.id}`,
            })
          })
        }

        if (data.documents) {
          data.documents.forEach((d: any) => {
            results.push({
              id: `doc-${d.id}`,
              type: 'document',
              title: d.name,
              subtitle: d.description || '',
              path: `/documents/${d.id}`,
            })
          })
        }

        setSearchResults(results)
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    setIsSearching(true)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allResults[selectedIdx]) runCommand(allResults[selectedIdx])
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const typeIcons: Record<string, any> = {
    nav: null,
    car: Car,
    maintenance: Wrench,
    expense: DollarSign,
    document: FileText,
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg animate-scale-in rounded-2xl bg-white shadow-soft-lg dark:bg-surface-800">
        <div className="flex items-center gap-3 border-b border-surface-200 px-4 dark:border-surface-700">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-surface-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-surface-400" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.search') + '...'}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder-surface-400"
          />
          <kbd className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-700">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {allResults.length > 0 ? (
            allResults.map((item, idx) => {
              const Icon = typeIcons[item.type] || Search
              return (
                <button
                  key={item.id}
                  onClick={() => runCommand(item)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    idx === selectedIdx ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate w-full">{item.title}</span>
                    {item.subtitle && <span className="text-xs text-surface-400 truncate w-full">{item.subtitle}</span>}
                  </div>
                </button>
              )
            })
          ) : query.length >= 2 && !isSearching ? (
            <p className="py-4 text-center text-sm text-surface-400">Ничего не найдено</p>
          ) : query.length < 2 ? (
            <p className="py-4 text-center text-sm text-surface-400">Введите минимум 2 символа для поиска</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
