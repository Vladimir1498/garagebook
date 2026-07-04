import { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, CreditCard, LogOut, Shield, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeContext } from '../../contexts/ThemeContext'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { theme, setTheme, isDark } = useContext(ThemeContext)
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

  const items = [
    { icon: Settings, label: 'Настройки', onClick: () => { navigate('/settings'); setOpen(false) } },
    { icon: CreditCard, label: 'Тариф', onClick: () => { navigate('/pricing'); setOpen(false) } },
    ...(user?.is_admin ? [{ icon: Shield, label: 'Админ', onClick: () => { navigate('/admin'); setOpen(false) } }] : []),
  ]

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
            {user?.full_name?.charAt(0) || '?'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-fade-in rounded-2xl border border-surface-200 bg-white py-2 shadow-soft-lg dark:border-surface-700 dark:bg-surface-800">
          <div className="border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{user?.full_name}</p>
            <p className="text-xs text-surface-500">{user?.email}</p>
          </div>

          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}

          <div className="border-t border-surface-200 dark:border-surface-700">
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
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
