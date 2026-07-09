import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

function isStandalonePwa(): boolean {
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  )
}

// Promise with timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ])
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const supported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)
    setPlatform(detectPlatform())

    if (supported && typeof Notification !== 'undefined') {
      try {
        setPermission(Notification.permission)
      } catch (error) {
        console.warn('Notification permission unavailable:', error)
        setPermission('default')
      }
    }

    if (supported) {
      navigator.serviceWorker.ready.then((reg) => {
        if (!mountedRef.current) return
        reg.pushManager.getSubscription().then((sub) => {
          if (mountedRef.current) setIsSubscribed(!!sub)
        }).catch(() => {})
      }).catch(() => {})
    }

    return () => { mountedRef.current = false }
  }, [])

  const subscribe = useCallback(async () => {
    if (loading) return
    setLoading(true)

    try {
      const currentPlatform = detectPlatform()
      if (currentPlatform === 'ios' && !isStandalonePwa()) {
        throw new Error('На iPhone push-уведомления работают только из приложения, добавленного на экран Домой. Откройте сайт в Safari и выберите «Добавить на экран Домой».')
      }

      // Step 1: Permission with timeout
      const result = await withTimeout(Notification.requestPermission(), 10000)
      if (!mountedRef.current) return
      setPermission(result)

      if (result !== 'granted') {
        toast.error('Разрешение на уведомления не получено')
        setLoading(false)
        return
      }

      // Step 2: Service worker
      let reg: ServiceWorkerRegistration
      try {
        reg = await withTimeout(navigator.serviceWorker.ready, 5000)
      } catch {
        if (mountedRef.current) {
          toast.error('Service Worker не готов. Перезагрузите страницу')
          setLoading(false)
        }
        return
      }

      // Step 3: VAPID key
      let publicKey: string
      try {
        const resp = await withTimeout(
          fetch(`${API_URL}/api/v1/push/vapid-public-key`),
          5000
        )
        if (!resp.ok) throw new Error('Bad response')
        const data = await resp.json()
        publicKey = data.public_key
        if (data.error) {
          toast.error(data.error)
          setLoading(false)
          return
        }
      } catch {
        if (mountedRef.current) {
          toast.error('Сервер не отвечает. Попробуйте позже')
          setLoading(false)
        }
        return
      }

      if (!publicKey) {
        toast.error('VAPID ключи не настроены на сервере')
        setLoading(false)
        return
      }

      // Step 4: Subscribe
      let subscription: PushSubscription
      try {
        const key = urlBase64ToUint8Array(publicKey)
        subscription = await withTimeout(
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key.buffer as ArrayBuffer,
          }),
          10000
        )
      } catch (e: any) {
        if (mountedRef.current) {
          toast.error('Не удалось подписаться: ' + (e.message || 'Ошибка'))
          setLoading(false)
        }
        return
      }

      // Step 5: Send to backend
      const subJson = subscription.toJSON()
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Нужно войти в аккаунт, чтобы сохранить подписку на уведомления')
      }

      try {
        const response = await withTimeout(
          fetch(`${API_URL}/api/v1/push/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              endpoint: subJson.endpoint,
              p256dh: subJson.keys?.p256dh || '',
              auth: subJson.keys?.auth || '',
            }),
          }),
          10000
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          const message = errorData?.detail || errorData?.error || 'Сервер отклонил подписку'
          throw new Error(message)
        }
      } catch (e: any) {
        if (mountedRef.current) {
          setIsSubscribed(false)
        }
        throw e
      }

      if (mountedRef.current) {
        setIsSubscribed(true)
        toast.success('Push-уведомления включены!')
      }
    } catch (err: any) {
      if (mountedRef.current) {
        toast.error('Ошибка: ' + (err.message || 'Попробуйте позже'))
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [loading])

  const unsubscribe = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }
      setIsSubscribed(false)
      toast.success('Push-уведомления выключены')
    } catch {
      toast.error('Ошибка отписки')
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { isSupported, isSubscribed, permission, loading, platform, subscribe, unsubscribe }
}
