import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Check, BellRing } from 'lucide-react'
import { useContext } from 'react'
import { NotificationContext } from '../../contexts/NotificationContext'

export default function NotificationBell() {
  const { t } = useTranslation()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2.5 text-surface-500 transition-colors hover:bg-surface-100 dark:hover:bg-surface-700"
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-fade-in rounded-2xl border border-surface-200 bg-white shadow-soft-lg dark:border-surface-700 dark:bg-surface-800">
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nav.reminders')}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:text-primary-600">
                Прочитать все
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-surface-300" />
                <p className="mt-2 text-sm text-surface-500">Нет уведомлений</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700 ${!n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                >
                  <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${!n.is_read ? 'bg-primary-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-xs text-surface-500 truncate">{n.body}</p>
                    <p className="mt-1 text-[10px] text-surface-400">{new Date(n.created_at).toLocaleString('ru')}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
