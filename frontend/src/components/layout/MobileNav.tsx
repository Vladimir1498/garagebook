import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, Wrench, DollarSign, BarChart3, FileText, Bell, Users, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const mainItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/cars', icon: Car, label: 'nav.cars' },
  { path: '/maintenance', icon: Wrench, label: 'nav.maintenance' },
  { path: '/expenses', icon: DollarSign, label: 'nav.expenses' },
  { path: '/analytics', icon: BarChart3, label: 'nav.analytics' },
]

const moreItems = [
  { path: '/documents', icon: FileText, label: 'nav.documents' },
  { path: '/reminders', icon: Bell, label: 'nav.reminders' },
  { path: '/fleet', icon: Users, label: 'nav.fleet' },
]

export default function MobileNav() {
  const { t } = useTranslation()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-200 bg-white/80 backdrop-blur-xl dark:border-surface-700 dark:bg-surface-900/80 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {mainItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] transition-colors ${
                  isActive ? 'text-primary-500' : 'text-surface-400'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{t(label).split(' ')[0]}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] text-surface-400 transition-colors hover:text-surface-600"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Ещё</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-16 left-4 right-4 animate-slide-up rounded-2xl border border-surface-200 bg-white p-4 shadow-soft-lg dark:border-surface-700 dark:bg-surface-800">
            <h3 className="mb-3 text-sm font-semibold text-surface-900 dark:text-white">Другие разделы</h3>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-500 dark:bg-primary-900/20' : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-700'
                    }`
                  }
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{t(label)}</span>
                </NavLink>
              ))}
              <NavLink
                to="/settings"
                onClick={() => setShowMore(false)}
                className="flex flex-col items-center gap-2 rounded-xl p-3 text-surface-600 transition-colors hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-700"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="text-xs font-medium">Настройки</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
