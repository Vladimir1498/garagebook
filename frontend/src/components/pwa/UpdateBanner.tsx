import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import Button from '../ui/Button'

export default function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true)
                setRegistration(reg)
              }
            })
          }
        })
      })
    }
  }, [])

  if (!needRefresh) return null

  const handleUpdate = () => {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-primary-200 bg-primary-50 p-4 shadow-soft-lg md:bottom-auto md:left-auto md:right-6 md:top-20 md:w-80 dark:border-primary-800 dark:bg-primary-900/30">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Доступно обновление</p>
          <p className="text-xs text-primary-600 dark:text-primary-400">Обновите приложение для получения новых функций</p>
        </div>
        <Button size="sm" onClick={handleUpdate}>Обновить</Button>
      </div>
    </div>
  )
}
