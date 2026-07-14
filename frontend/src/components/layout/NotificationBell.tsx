import { useState, useRef, useEffect, useContext } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { NotificationContext } from '../../contexts/NotificationContext'
import { clsx } from 'clsx'
import api from '../../services/api'

export default function NotificationBell() {
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

  const clearAll = async () => {
    try {
      await api.delete('/api/v1/notifications')
      window.location.reload()
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-surface-300"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-scale-in rounded-xl border border-surface-200 bg-white shadow-elevated dark:border-surface-700 dark:bg-surface-800">
          <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Уведомления</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600">
                <CheckCheck className="h-3 w-3" />
                Прочитать все
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600">
                <Trash2 className="h-3 w-3" />
                Очистить
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-700">
                  <Bell className="h-5 w-5 text-surface-400" />
                </div>
                <p className="mt-3 text-sm text-surface-500">Нет уведомлений</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link }}
                  className={clsx(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700/50',
                    !n.is_read && 'bg-primary-50/30 dark:bg-primary-950/10'
                  )}
                >
                  {!n.is_read && <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />}
                  <div className={clsx('min-w-0 flex-1', n.is_read && 'pl-[18px]')}>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-xs text-surface-500 truncate dark:text-surface-400">{n.body}</p>
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
