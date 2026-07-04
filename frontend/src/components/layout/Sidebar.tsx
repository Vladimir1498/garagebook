import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Car, Wrench, DollarSign, FileText, Bell, BarChart3, Users, Settings, CreditCard, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/cars', icon: Car, label: 'nav.cars' },
  { path: '/maintenance', icon: Wrench, label: 'nav.maintenance' },
  { path: '/expenses', icon: DollarSign, label: 'nav.expenses' },
  { path: '/documents', icon: FileText, label: 'nav.documents' },
  { path: '/reminders', icon: Bell, label: 'nav.reminders' },
  { path: '/analytics', icon: BarChart3, label: 'nav.analytics' },
  { path: '/fleet', icon: Users, label: 'nav.fleet' },
]

const bottomItems = [
  { path: '/pricing', icon: CreditCard, label: 'nav.pricing' },
  { path: '/settings', icon: Settings, label: 'nav.settings' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-6 dark:border-surface-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">G</div>
        <span className="text-lg font-bold">GarageBook</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {t(label)}
          </NavLink>
        ))}
        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'
              }`
            }
          >
            <Shield className="h-5 w-5" />
            {t('nav.admin')}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-surface-200 p-3 dark:border-surface-700">
        {bottomItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {t(label)}
          </NavLink>
        ))}
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
