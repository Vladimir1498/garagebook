import { useState, useEffect, useCallback } from 'react'
import { queueAction, syncPendingActions, getPendingCount } from '../utils/offlineQueue'
import api from '../services/api'
import toast from 'react-hot-toast'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // Check pending count on mount
    getPendingCount().then(setPendingCount)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync()
    }
  }, [isOnline])

  const handleSync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const result = await syncPendingActions()
      if (result.synced > 0) {
        toast.success(`Синхронизировано: ${result.synced} записей`)
        setPendingCount((p) => Math.max(0, p - result.synced))
      }
      if (result.failed > 0) {
        toast.error(`Не удалось синхронизировать: ${result.failed}`)
      }
    } catch {
      toast.error('Ошибка синхронизации')
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  // Offline-aware API call
  const offlineRequest = useCallback(
    async (url: string, method: string, body?: any) => {
      if (navigator.onLine) {
        try {
          const response = await api({ url, method, data: body })
          return response
        } catch (err: any) {
          // If network error, queue for later
          if (!err.response) {
            await queueAction(`${api.defaults.baseURL}${url}`, method, body)
            setPendingCount((p) => p + 1)
            toast('Действие сохранено офлайн. Отправится при подключении.', { icon: '📴' })
            return { data: body, offline: true }
          }
          throw err
        }
      } else {
        // Offline: queue the action
        await queueAction(`${api.defaults.baseURL}${url}`, method, body)
        setPendingCount((p) => p + 1)
        toast('Действие сохранено офлайн. Отправится при подключении.', { icon: '📴' })
        return { data: body, offline: true }
      }
    },
    []
  )

  return { isOnline, pendingCount, syncing, syncPending: handleSync, offlineRequest }
}
