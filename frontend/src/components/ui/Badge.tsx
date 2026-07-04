import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      {
        'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300': variant === 'default',
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': variant === 'success',
        'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
        'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
        'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
        'px-2 py-0.5 text-xs': size === 'sm',
        'px-2.5 py-1 text-sm': size === 'md',
      }
    )}>
      {children}
    </span>
  )
}
