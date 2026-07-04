import { Bell, BellOff, BellRing } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import Button from '../ui/Button'

export default function PushToggle() {
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
        <BellOff className="h-5 w-5 text-surface-400" />
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Push-уведомления</p>
          <p className="text-xs text-surface-500">Не поддерживаются в этом браузере</p>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <BellOff className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Push-уведомления заблокированы</p>
          <p className="text-xs text-red-500">Разрешите уведомления в настройках браузера</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <BellRing className="h-5 w-5 text-emerald-500" />
        ) : (
          <Bell className="h-5 w-5 text-surface-400" />
        )}
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Push-уведомления</p>
          <p className="text-xs text-surface-500">
            {isSubscribed ? 'Включены — вы будете получать напоминания' : 'Получайте напоминания о ТО и страховке'}
          </p>
        </div>
      </div>
      <Button
        variant={isSubscribed ? 'secondary' : 'primary'}
        size="sm"
        onClick={isSubscribed ? unsubscribe : subscribe}
        loading={loading}
      >
        {isSubscribed ? 'Выключить' : 'Включить'}
      </Button>
    </div>
  )
}
