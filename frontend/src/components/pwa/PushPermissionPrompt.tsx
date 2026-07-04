import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import Button from '../ui/Button'

export default function PushPermissionPrompt() {
  const { isSupported, isSubscribed, permission, loading, subscribe } = usePushNotifications()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show after 10 seconds if user hasn't subscribed and permission is default
    if (isSupported && permission === 'default' && !isSubscribed) {
      const key = 'push_prompt_shown'
      if (!sessionStorage.getItem(key)) {
        const timer = setTimeout(() => {
          setShow(true)
          sessionStorage.setItem(key, 'true')
        }, 10000)
        return () => clearTimeout(timer)
      }
    }
  }, [isSupported, permission, isSubscribed])

  if (!show || !isSupported || permission !== 'default' || isSubscribed) return null

  return (
    <div className="fixed bottom-36 left-4 right-4 z-50 animate-slide-up md:bottom-8 md:left-auto md:right-6 md:w-96">
      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-soft-lg dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5 text-primary-500 dark:bg-primary-900/20">
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">
              Не пропустите ТО
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              Включите push-уведомления чтобы получать напоминания о обслуживании, страховке и техосмотре
            </p>
          </div>
          <button onClick={() => setShow(false)} className="rounded-lg p-1 text-surface-400 hover:text-surface-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={async () => { await subscribe(); setShow(false) }} loading={loading} className="flex-1">
            Включить уведомления
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShow(false)}>
            Позже
          </Button>
        </div>
      </div>
    </div>
  )
}
