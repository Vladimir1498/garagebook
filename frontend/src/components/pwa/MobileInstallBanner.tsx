import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Share } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import Button from '../ui/Button'

export default function MobileInstallBanner() {
  const { canInstall, isMobile, platform, hasNativePrompt, promptInstall, dismiss } = usePwaInstall()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show on any mobile device after 3 seconds
    if (isMobile && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [isMobile, dismissed])

  if (!show || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    dismiss()
  }

  const isIOS = platform === 'ios'

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up md:hidden">
      <div className="rounded-2xl border border-primary-200 bg-white p-4 shadow-soft-lg dark:border-primary-800 dark:bg-surface-800">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5 text-primary-500 dark:bg-primary-900/20">
            {isIOS ? <Share className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">
              {isIOS ? 'Добавить на экран' : 'Установить GarageBook'}
            </p>
            {isIOS ? (
              <p className="mt-0.5 text-xs text-surface-500">
                Нажмите <span className="font-semibold">Поделиться</span> → <span className="font-semibold">На экран Домой</span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-surface-500">
                Добавьте на главный экран для быстрого доступа
              </p>
            )}
          </div>
          <button onClick={handleDismiss} className="rounded-lg p-1 text-surface-400 hover:text-surface-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {hasNativePrompt ? (
            <Button size="sm" onClick={promptInstall} className="flex-1">
              <Download className="h-4 w-4" />
              Установить
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={handleDismiss} className="flex-1">
              {isIOS ? 'Понятно' : 'Установить'}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Позже
          </Button>
        </div>
      </div>
    </div>
  )
}
