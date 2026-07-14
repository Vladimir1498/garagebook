import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Moon, Sun } from 'lucide-react'
import { ThemeContext } from '../../contexts/ThemeContext'
import { CommandPaletteContext } from '../../contexts/CommandPaletteContext'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

export default function Header() {
  const { t } = useTranslation()
  const { isDark, setTheme } = useContext(ThemeContext)
  const { open } = useContext(CommandPaletteContext)

  return (
    <header className="relative z-40 flex h-14 items-center justify-between border-b border-surface-100 bg-white/80 px-4 backdrop-blur-xl dark:border-surface-700/50 dark:bg-surface-900/80 sm:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <img src="/logo.svg" alt="GarageBook" className="h-7 w-7" />
        <span className="text-[15px] font-semibold tracking-tight text-surface-900 dark:text-white">GarageBook</span>
      </div>

      {/* Search trigger */}
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={open}
          className="flex h-8 items-center gap-2 rounded-lg border border-surface-200 bg-surface-50/50 px-3 text-sm text-surface-400 transition-all hover:border-surface-300 hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800/50 dark:hover:border-surface-500 dark:hover:bg-surface-800 sm:h-9 sm:px-3.5"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('common.search')}</span>
          <kbd className="ml-2 hidden rounded border border-surface-200 px-1.5 py-0.5 font-mono text-[10px] text-surface-400 dark:border-surface-600 sm:inline">⌘K</kbd>
        </button>

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
