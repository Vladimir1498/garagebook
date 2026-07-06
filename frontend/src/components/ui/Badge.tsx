import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
}

export default function Badge({ children, variant = 'default', size = 'sm', dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      {
        'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300': variant === 'default',
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400': variant === 'success',
        'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400': variant === 'warning',
        'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400': variant === 'danger',
        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': variant === 'info',
        'px-2 py-0.5 text-[11px]': size === 'sm',
        'px-2.5 py-1 text-xs': size === 'md',
      }
    )}>
      {dot && <span className={clsx(
        'h-1.5 w-1.5 rounded-full',
        {
          'bg-surface-400': variant === 'default',
          'bg-emerald-500': variant === 'success',
          'bg-amber-500': variant === 'warning',
          'bg-red-500': variant === 'danger',
          'bg-blue-500': variant === 'info',
        }
      )} />}
      {children}
    </span>
  )
}
