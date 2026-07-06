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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-2xl bg-white p-5 pb-8 shadow-elevated dark:bg-surface-800"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 32px)' }}>
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
        </div>
        {title && <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
