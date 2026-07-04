import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

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

function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'desktop'
}

function isMobileDevice(): boolean {
  return /android|iphone|ipad|ipod|mobile|windows phone/i.test(navigator.userAgent.toLowerCase())
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)
    setPermission(Notification.permission)
    setPlatform(detectPlatform())

    if (supported) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub)
        }).catch(() => {})
      }).catch(() => {})
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        toast.error('Разрешение на уведомления не получено')
        setLoading(false)
        return
      }

      const reg = await navigator.serviceWorker.ready

      // Fetch VAPID key with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${api.defaults.baseURL}/api/v1/push/vapid-public-key`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        toast.error('Сервер не отвечает')
        setLoading(false)
        return
      }

      const { public_key } = await response.json()
      if (!public_key) {
        toast.error('VAPID ключи не настроены')
        setLoading(false)
        return
      }

      const applicationServerKey = urlBase64ToUint8Array(public_key)

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
      toast.success('Push-уведомления включены!')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.error('Сервер не отвечает. Попробуйте позже')
      } else if (err.message?.includes('VAPID')) {
        toast.error('VAPID ключи настроены неверно')
      } else {
        toast.error('Ошибка: ' + (err.message || 'Попробуйте позже'))
      }
    } finally {
      setLoading(false)
    }
  }, [loading])

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
      toast.success('Push-уведомления выключены')
    } catch (err) {
      toast.error('Ошибка отписки')
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { isSupported, isSubscribed, permission, loading, platform, subscribe, unsubscribe }
}
