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
    <div className="space-y-4 md:space-y-6">
      <div>
        {backTo && (
          <button onClick={() => navigate(backTo)} className="mb-2 flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white md:text-2xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-surface-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
      {children}
    </div>
  )
}
