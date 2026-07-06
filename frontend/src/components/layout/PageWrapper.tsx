import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageWrapperProps {
  title: string
  subtitle?: string
  action?: ReactNode
  backTo?: string
  children: ReactNode
}

export default function PageWrapper({ title, subtitle, action, backTo, children }: PageWrapperProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-surface-400 transition-colors hover:text-surface-700 dark:hover:text-surface-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Назад
          </button>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
      {children}
    </div>
  )
}
