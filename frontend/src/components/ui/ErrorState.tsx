import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = 'Что-то пошло не так', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{message}</h3>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  )
}
