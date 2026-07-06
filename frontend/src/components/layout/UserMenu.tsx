import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, CreditCard, LogOut, Shield, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { clsx } from 'clsx'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'

  const items = [
    { icon: Settings, label: 'Настройки', onClick: () => { navigate('/settings'); setOpen(false) } },
    { icon: CreditCard, label: 'Тариф', onClick: () => { navigate('/pricing'); setOpen(false) } },
    ...(user?.is_admin ? [{ icon: Shield, label: 'Админ', onClick: () => { navigate('/admin'); setOpen(false) } }] : []),
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 animate-scale-in rounded-xl border border-surface-200 bg-white py-1.5 shadow-elevated dark:border-surface-700 dark:bg-surface-800">
          <div className="border-b border-surface-100 px-3.5 py-2.5 dark:border-surface-700">
            <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{user?.full_name}</p>
            <p className="truncate text-xs text-surface-500 dark:text-surface-400">{user?.email}</p>
          </div>

          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700/50"
              >
                <item.icon className="h-4 w-4 text-surface-400" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-surface-100 pt-1 dark:border-surface-700">
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
