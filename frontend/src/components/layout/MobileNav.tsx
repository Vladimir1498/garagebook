import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, Plus, MoreHorizontal, Wrench, DollarSign, FileText, Bell, BarChart3, Settings, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/cars', icon: Car, label: 'nav.cars' },
]

const createItems = [
  { path: '/maintenance/new', icon: Wrench, label: 'Обслуживание' },
  { path: '/expenses/new', icon: DollarSign, label: 'Расход' },
  { path: '/documents', icon: FileText, label: 'Документ' },
]

const moreItems = [
  { path: '/maintenance', icon: Wrench, label: 'nav.maintenance' },
  { path: '/expenses', icon: DollarSign, label: 'nav.expenses' },
  { path: '/documents', icon: FileText, label: 'nav.documents' },
  { path: '/fleet', icon: Users, label: 'nav.fleet' },
  { path: '/analytics', icon: BarChart3, label: 'nav.analytics' },
  { path: '/settings', icon: Settings, label: 'nav.settings' },
]

function useSwipeToDismiss(onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
      sheetRef.current.style.willChange = 'transform'
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) {
      e.preventDefault()
      sheetRef.current.style.transform = `translateY(${delta}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    if (!sheetRef.current) return
    const currentTransform = sheetRef.current.style.transform
    const match = currentTransform.match(/translateY\((\d+)px\)/)
    const currentY = match ? parseInt(match[1]) : 0

    sheetRef.current.style.willChange = 'auto'
    sheetRef.current.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'

    if (currentY > 80) {
      sheetRef.current.style.transform = 'translateY(100%)'
      sheetRef.current.addEventListener('transitionend', () => onClose(), { once: true })
    } else {
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }, [onClose])

  return { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd }
}

export default function MobileNav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const createSwipe = useSwipeToDismiss(() => setShowCreate(false))
  const moreSwipe = useSwipeToDismiss(() => setShowMore(false))

  // Prevent pull-to-refresh when sheet is open
  useEffect(() => {
    if (!showCreate && !showMore) return
    const prevent = (e: TouchEvent) => {
      if (e.touches.length > 1) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [showCreate, showMore])

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-100 bg-white/95 backdrop-blur-xl dark:border-surface-700/50 dark:bg-surface-900/95 lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 items-end px-1 pt-2 pb-2">
          {/* Дашборд */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 py-1',
              isActive ? 'text-primary-500' : 'text-surface-400'
            )}
          >
            <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{t('nav.dashboard')}</span>
          </NavLink>

          {/* Авто */}
          <NavLink
            to="/cars"
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 py-1',
              isActive ? 'text-primary-500' : 'text-surface-400'
            )}
          >
            <Car className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{t('nav.cars')}</span>
          </NavLink>

          {/* + кнопка по центру */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-12 w-12 -mt-5 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/25 transition-all active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Напоминания */}
          <NavLink
            to="/reminders"
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 py-1',
              isActive ? 'text-primary-500' : 'text-surface-400'
            )}
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{t('nav.reminders')}</span>
          </NavLink>

          {/* Ещё */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-0.5 py-1 text-surface-400"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Ещё</span>
          </button>
        </div>
      </nav>

      {/* Создать — swipe to dismiss + Отмена */}
      {showCreate && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            ref={createSwipe.sheetRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-elevated dark:bg-surface-800"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', overscrollBehavior: 'contain' }}
          >
            <div
              onTouchStart={createSwipe.handleTouchStart}
              onTouchMove={createSwipe.handleTouchMove}
              onTouchEnd={createSwipe.handleTouchEnd}
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <p className="px-5 pb-2 text-xs font-medium text-surface-400">Создать</p>
            <div className="space-y-1 px-3 pb-2">
              {createItems.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  onClick={() => { setShowCreate(false); navigate(path) }}
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
              onClick={() => setShowCreate(false)}
              className="w-full border-t border-surface-100 py-3 text-sm font-medium text-surface-500 dark:border-surface-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Ещё — swipe to dismiss */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            ref={moreSwipe.sheetRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-elevated dark:bg-surface-800"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', overscrollBehavior: 'contain' }}
          >
            <div
              onTouchStart={moreSwipe.handleTouchStart}
              onTouchMove={moreSwipe.handleTouchMove}
              onTouchEnd={moreSwipe.handleTouchEnd}
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            <div className="grid grid-cols-3 gap-1 px-4 pb-2">
              {moreItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl py-3',
                    isActive ? 'bg-primary-50 text-primary-500 dark:bg-primary-950/30' : 'text-surface-600 dark:text-surface-400'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
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
