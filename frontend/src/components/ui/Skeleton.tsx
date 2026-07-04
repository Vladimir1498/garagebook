import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx(
      'animate-pulse rounded-xl bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 dark:from-surface-700 dark:via-surface-600 dark:to-surface-700',
      'bg-[length:200%_100%] animate-shimmer',
      className
    )} />
  )
}
