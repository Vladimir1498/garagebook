import { useContext } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { OfflineContext } from '../../contexts/OfflineContext'

export default function OfflineBanner() {
  const { isOnline, pendingCount, syncing, syncPending } = useContext(OfflineContext)

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={clsx(
      'fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors',
      isOnline ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
    )}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        {isOnline ? (
          pendingCount > 0 ? `Синхронизация... (${pendingCount})` : 'Онлайн'
        ) : (
          'Офлайн-режим'
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={syncPending}
          disabled={syncing}
          className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-xs transition-colors hover:bg-white/30"
        >
          <RefreshCw className={clsx('h-3 w-3', syncing && 'animate-spin')} />
          Синхронизировать
        </button>
      )}

      {!isOnline && pendingCount > 0 && (
        <span className="text-xs opacity-80">{pendingCount} в очереди</span>
      )}
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
