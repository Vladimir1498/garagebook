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
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Поиск по данным при вводе текста
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.length < 1) {
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
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
              subtitle: car.license_plate || car.vin || car.color || '',
              path: `/cars/${car.id}`,
            })
          })
        }

        if (data.maintenance) {
          data.maintenance.forEach((m: any) => {
            const parts = [m.service_type_label || m.service_type]
            if (m.service_center) parts.push(m.service_center)
            if (m.description) parts.push(m.description)
            results.push({
              id: `maint-${m.id}`,
              type: 'maintenance',
              title: parts.join(' · '),
              subtitle: `${m.date} — ${m.cost} ₽`,
              path: `/maintenance/${m.id}`,
            })
          })
        }

        if (data.expenses) {
          data.expenses.forEach((e: any) => {
            results.push({
              id: `exp-${e.id}`,
              type: 'expense',
              title: `${e.category_label || e.category}`,
              subtitle: e.description || `${e.date} — ${e.amount} ₽`,
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
    }, 250)

    setIsSearching(true)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allResults[selectedIdx]) runCommand(allResults[selectedIdx])
    if (e.key === 'Escape') { close(); setQuery(''); setSearchResults([]) }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSearchResults([])
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

  const typeLabels: Record<string, string> = {
    car: '🚗 Авто',
    maintenance: '🔧 ТО',
    expense: '💰 Расход',
    document: '📄 Документ',
    nav: '📌 Раздел',
  }

  const hasQuery = query.length > 0

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
          {/* Навигация показывается только когда нет запроса */}
          {!hasQuery && (
            <>
              <p className="px-3 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">Разделы</p>
              {filteredNav.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => runCommand({ id: cmd.id, type: 'nav', title: t(cmd.label), subtitle: '', path: cmd.path })}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    idx === selectedIdx ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700'
                  }`}
                >
                  <cmd.icon className="h-4 w-4 shrink-0" />
                  <span>{t(cmd.label)}</span>
                </button>
              ))}
            </>
          )}

          {/* Результаты поиска по данным */}
          {hasQuery && (
            <>
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 text-surface-400 animate-spin" />
                  <span className="ml-2 text-sm text-surface-400">Поиск...</span>
                </div>
              )}

              {!isSearching && searchResults.length === 0 && query.length >= 1 && (
                <p className="py-4 text-center text-sm text-surface-400">Ничего не найдено по запросу «{query}»</p>
              )}

              {!isSearching && searchResults.length > 0 && (
                <>
                  <p className="px-3 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Результаты поиска ({searchResults.length})
                  </p>
                  {searchResults.map((item, idx) => {
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-100 dark:bg-surface-600">
                          <Icon className="h-3.5 w-3.5 text-surface-500" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{item.title}</span>
                          {item.subtitle && <span className="truncate text-xs text-surface-400">{item.subtitle}</span>}
                        </div>
                        <span className="ml-auto shrink-0 text-[10px] text-surface-300 dark:text-surface-600">
                          {typeLabels[item.type] || ''}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
