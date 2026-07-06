import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Car, Wrench, DollarSign, FileText, Bell, BarChart3, Users, Settings, CreditCard, Shield, ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { clsx } from 'clsx'

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

function NavItem({ path, icon: Icon, label, collapsed }: { path: string; icon: any; label: string; collapsed: boolean }) {
  const { t } = useTranslation()
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
            : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-700/50 dark:hover:text-surface-200'
        )
      }
      title={collapsed ? t(label) : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{t(label)}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside className={clsx(
      'hidden flex-shrink-0 flex-col border-r border-surface-100 bg-white transition-all duration-200 dark:border-surface-700/50 dark:bg-surface-900 lg:flex',
      collapsed ? 'w-[68px]' : 'w-[220px]'
    )}>
      {/* Logo */}
      <div className={clsx('flex h-14 items-center border-b border-surface-100 dark:border-surface-700/50', collapsed ? 'justify-center px-2' : 'gap-2.5 px-5')}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-[11px] font-bold text-white">G</div>
        {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-surface-900 dark:text-white">GarageBook</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <div className="mb-2">
          {!collapsed && <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-surface-400 dark:text-surface-500">Main</p>}
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} collapsed={collapsed} />
          ))}
          {user?.is_admin && (
            <NavItem path="/admin" icon={Shield} label="nav.admin" collapsed={collapsed} />
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="space-y-0.5 border-t border-surface-100 px-3 py-3 dark:border-surface-700/50">
        {bottomItems.map((item) => (
          <NavItem key={item.path} {...item} collapsed={collapsed} />
        ))}
        <button
          onClick={logout}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-surface-400 dark:hover:bg-red-950/30 dark:hover:text-red-400',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? t('nav.logout') : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-9 items-center justify-center border-t border-surface-100 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:border-surface-700/50 dark:hover:bg-surface-700/50"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
