import { useState, useRef, useCallback } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current
    if (el && el.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - startY.current
    if (delta > 80 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }, [isRefreshing, onRefresh])

  return { containerRef, isRefreshing, handleTouchStart, handleTouchEnd }
}
