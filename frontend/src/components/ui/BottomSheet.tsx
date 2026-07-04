import { useEffect, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-3xl bg-white p-6 shadow-soft-lg dark:bg-surface-800">
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-surface-300" />
        </div>
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
