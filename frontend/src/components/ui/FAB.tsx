import { Plus } from 'lucide-react'
import { clsx } from 'clsx'

interface FABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
}

export default function FAB({ onClick, icon, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full bg-primary-500 p-4 text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl active:scale-95 md:bottom-8',
        label && 'px-5'
      )}
      aria-label={label || 'Добавить'}
    >
      {icon || <Plus className="h-6 w-6" />}
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}
