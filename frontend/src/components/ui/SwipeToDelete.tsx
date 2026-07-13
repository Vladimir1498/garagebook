import { useRef, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'

interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
  deleteLabel?: string
}

export default function SwipeToDelete({ children, onDelete, deleteLabel = 'Удалить' }: SwipeToDeleteProps) {
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
    if (ref.current) ref.current.style.transition = 'none'
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const delta = e.touches[0].clientX - startX.current
    if (delta < 0) {
      setOffsetX(Math.max(delta, -120))
    }
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (ref.current) ref.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
    if (offsetX < -80) {
      setOffsetX(-80)
    } else {
      setOffsetX(0)
    }
  }, [offsetX])

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-20 bg-red-500 text-white rounded-r-xl">
        <Trash2 className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-1">{deleteLabel}</span>
      </div>

      {/* Content */}
      <div
        ref={ref}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (offsetX < -80) {
            onDelete()
            setOffsetX(0)
          }
        }}
        style={{ transform: `translateX(${offsetX}px)` }}
        className="relative bg-white dark:bg-surface-800 transition-transform"
      >
        {children}
      </div>
    </div>
  )
}
