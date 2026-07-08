import { useContext } from 'react'
import { OfflineContext } from '../../contexts/OfflineContext'
import { WifiOff, RefreshCw } from 'lucide-react'
import { clsx } from 'clsx'

export default function OfflineBanner() {
  const { isOnline, pendingCount, syncing, syncPending } = useContext(OfflineContext)

  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-xs font-medium lg:hidden',
        !isOnline
          ? 'bg-amber-500 text-white'
          : 'bg-primary-500 text-white'
      )}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>Офлайн режим</span>
          </>
        ) : (
          <>
            <RefreshCw className={clsx('h-3.5 w-3.5', syncing && 'animate-spin')} />
            <span>{pendingCount} записей ожидают синхронизации</span>
          </>
        )}
      </div>
      {isOnline && pendingCount > 0 && !syncing && (
        <button
          onClick={syncPending}
          className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/30"
        >
          Синхронизировать
        </button>
      )}
    </div>
  )
}
