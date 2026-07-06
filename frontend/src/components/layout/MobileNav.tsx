import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, Wrench, DollarSign, Plus, MoreHorizontal, FileText, Bell, Users, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const mainItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/cars', icon: Car, label: 'nav.cars' },
  { path: '/expenses', icon: DollarSign, label: 'nav.expenses' },
  { path: '/maintenance', icon: Wrench, label: 'nav.maintenance' },
]

const moreItems = [
  { path: '/documents', icon: FileText, label: 'nav.documents' },
  { path: '/reminders', icon: Bell, label: 'nav.reminders' },
  { path: '/analytics', icon: null, label: 'nav.analytics' },
  { path: '/fleet', icon: Users, label: 'nav.fleet' },
  { path: '/settings', icon: Settings, label: 'nav.settings' },
]

const quickAddItems = [
  { path: '/cars/new', icon: Car, label: 'Автомобиль' },
  { path: '/maintenance/new', icon: Wrench, label: 'Обслуживание' },
  { path: '/expenses/new', icon: DollarSign, label: 'Расход' },
]

export default function MobileNav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-100 bg-white/95 backdrop-blur-xl dark:border-surface-700/50 dark:bg-surface-900/95 lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
          {mainItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-1 flex-col items-center gap-0.5 py-1',
                  isActive ? 'text-primary-500' : 'text-surface-400'
                )
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-[10px] font-medium">{t(label)}</span>
            </NavLink>
          ))}

          {/* Center add button — opens quick-add menu */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex h-10 w-10 -mt-4 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              clsx('flex flex-1 flex-col items-center gap-0.5 py-1', isActive ? 'text-primary-500' : 'text-surface-400')
            }
          >
            <FileText className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{t('nav.documents')}</span>
          </NavLink>

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-surface-400"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Ещё</span>
          </button>
        </div>
      </nav>

      {/* Quick-add bottom sheet */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowQuickAdd(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-2xl bg-white shadow-elevated dark:bg-surface-800"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <p className="px-5 pb-2 text-xs font-medium text-surface-400">Быстрое добавление</p>
            <div className="space-y-1 px-3 pb-2">
              {quickAddItems.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  onClick={() => { setShowQuickAdd(false); navigate(path) }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-950/30">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-medium text-surface-800 dark:text-surface-100">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="w-full border-t border-surface-100 py-3 text-sm font-medium text-surface-500 dark:border-surface-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* More bottom sheet */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-2xl bg-white pb-8 shadow-elevated dark:bg-surface-800"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <div className="grid grid-cols-4 gap-1 px-4">
              {moreItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex flex-col items-center gap-1.5 rounded-xl py-3',
                      isActive ? 'bg-primary-50 text-primary-500 dark:bg-primary-950/30' : 'text-surface-600 dark:text-surface-400'
                    )
                  }
                >
                  {Icon && <Icon className="h-5 w-5" strokeWidth={1.75} />}
                  <span className="text-[10px] font-medium leading-tight text-center">{t(label)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
