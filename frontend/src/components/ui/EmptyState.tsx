import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-surface-300 dark:text-surface-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-surface-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
