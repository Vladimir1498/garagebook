import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800',
        hover ? 'card-interactive' : 'card',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
