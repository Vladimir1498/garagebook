import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, Wrench, DollarSign, Bell, BarChart3 } from 'lucide-react'

const items = [
  { path: '/', icon: LayoutDashboard },
  { path: '/cars', icon: Car },
  { path: '/maintenance', icon: Wrench },
  { path: '/expenses', icon: DollarSign },
  { path: '/analytics', icon: BarChart3 },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-200 bg-white/80 backdrop-blur-xl dark:border-surface-700 dark:bg-surface-900/80 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(({ path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-colors ${
                isActive ? 'text-primary-500' : 'text-surface-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
