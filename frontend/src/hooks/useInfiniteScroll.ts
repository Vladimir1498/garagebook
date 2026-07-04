import { useState, useEffect, useCallback, useRef } from 'react'

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect()
      if (!hasMore) return
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) callback()
      })
      if (node) observer.current.observe(node)
    },
    [callback, hasMore]
  )

  useEffect(() => () => observer.current?.disconnect(), [])
  return { lastElementRef }
}

export function usePullToRefresh(callback: () => void) {
  const [pulling, setPulling] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && e.touches[0].clientY - startY > 80) setPulling(true)
  }
  const handleTouchEnd = () => {
    if (pulling) { callback(); setPulling(false) }
  }

  return { pulling, handleTouchStart, handleTouchMove, handleTouchEnd }
}
