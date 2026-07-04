import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch {
      setIsSubscribed(false)
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported || loading) return
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') { setLoading(false); return }

      const reg = await navigator.serviceWorker.ready

      // Get VAPID public key from backend
      const { data } = await api.get('/api/v1/push/vapid-public-key')
      const applicationServerKey = urlBase64ToUint8Array(data.public_key)

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      })

      const subJson = subscription.toJSON()
      await api.post('/api/v1/push/subscribe', {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh || '',
        auth: subJson.keys?.auth || '',
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    } finally {
      setLoading(false)
    }
  }, [isSupported, loading])

  const unsubscribe = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await api.post('/api/v1/push/unsubscribe', { endpoint: subscription.endpoint })
        await subscription.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe }
}
