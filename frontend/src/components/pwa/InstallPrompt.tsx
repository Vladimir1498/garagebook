import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Button from '../ui/Button'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show || !deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-surface-200 bg-white p-4 shadow-soft-lg dark:border-surface-700 dark:bg-surface-800 md:bottom-auto md:left-auto md:right-6 md:top-20 md:w-80">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary-50 p-2 text-primary-500">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-900 dark:text-white">Установить GarageBook</p>
          <p className="mt-0.5 text-xs text-surface-500">Добавьте на главный экран для быстрого доступа</p>
        </div>
        <button onClick={() => setShow(false)} className="rounded-lg p-1 text-surface-400 hover:text-surface-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleInstall}>Установить</Button>
        <Button size="sm" variant="ghost" onClick={() => setShow(false)}>Позже</Button>
      </div>
    </div>
  )
}
