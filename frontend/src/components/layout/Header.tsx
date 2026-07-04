import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeContext } from '../../contexts/ThemeContext'
import { CommandPaletteContext } from '../../contexts/CommandPaletteContext'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

export default function Header() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { theme, setTheme, isDark } = useContext(ThemeContext)
  const { open } = useContext(CommandPaletteContext)

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 px-4 backdrop-blur-xl dark:border-surface-700 dark:bg-surface-900/80 md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white lg:hidden">G</div>
        <span className="text-lg font-bold lg:hidden">GarageBook</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={open}
          className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-400 transition-colors hover:bg-surface-100 dark:border-surface-600 dark:bg-surface-800 dark:hover:bg-surface-700"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">{t('common.search')}...</span>
          <kbd className="hidden rounded bg-surface-200 px-1.5 py-0.5 text-xs text-surface-500 md:inline dark:bg-surface-600">⌘K</kbd>
        </button>

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="rounded-xl p-2.5 text-surface-500 transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <NotificationBell />

        <UserMenu />
      </div>
    </header>
  )
}
