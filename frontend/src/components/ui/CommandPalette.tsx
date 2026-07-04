import { useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Car, Wrench, DollarSign, FileText, Bell, BarChart3, Settings, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CommandPaletteContext } from '../../contexts/CommandPaletteContext'
import { useAuth } from '../../hooks/useAuth'

const commands = [
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

export default function CommandPalette() {
  const { isOpen, close } = useContext(CommandPaletteContext)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)

  const filtered = commands.filter((c) =>
    t(c.label).toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase())
  )

  const runCommand = useCallback((cmd: typeof commands[0]) => {
    close()
    setQuery('')
    if (cmd.id === 'logout') logout()
    else navigate(cmd.path)
  }, [close, navigate, logout])

  useEffect(() => { setSelectedIdx(0) }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIdx]) runCommand(filtered[selectedIdx])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg animate-scale-in rounded-2xl bg-white shadow-soft-lg dark:bg-surface-800">
        <div className="flex items-center gap-3 border-b border-surface-200 px-4 dark:border-surface-700">
          <Search className="h-5 w-5 text-surface-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.search') + '...'}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder-surface-400"
          />
          <kbd className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-700">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={() => runCommand(cmd)}
              onMouseEnter={() => setSelectedIdx(idx)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                idx === selectedIdx ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700'
              }`}
            >
              <cmd.icon className="h-4 w-4" />
              {t(cmd.label)}
            </button>
          ))}
          {filtered.length === 0 && <p className="py-4 text-center text-sm text-surface-400">Ничего не найдено</p>}
        </div>
      </div>
    </div>
  )
}
