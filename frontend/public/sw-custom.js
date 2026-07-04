// GarageBook Service Worker — Offline + Push + Sync

const CACHE_NAME = 'garagebook-v1'
const STATIC_CACHE = 'garagebook-static-v1'
const API_CACHE = 'garagebook-api-v1'
const OFFLINE_URL = '/offline.html'

// Static assets to pre-cache
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET
  if (request.method !== 'GET') return

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses (except auth)
          if (response.ok && !url.pathname.includes('/auth/')) {
            const clone = response.clone()
            caches.open(API_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          // For navigation requests, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
          return new Response('Offline', { status: 503 })
        })
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title || 'GarageBook', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      tag: data.tag || 'garagebook-notification',
      renotify: true,
    })
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingActions())
  }
})

async function syncPendingActions() {
  const cache = await caches.open('garagebook-pending')
  const requests = await cache.keys()
  for (const request of requests) {
    try {
      const response = await cache.match(request)
      if (response) {
        const body = await response.json()
        await fetch(request.url, {
          method: request.method || 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        })
        await cache.delete(request)
      }
    } catch (e) {
      // Will retry on next sync
    }
  }

  // Notify client that sync is complete
  const clients_list = await clients.matchAll()
  clients_list.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' })
  })
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'QUEUE_OFFLINE_ACTION') {
    // Save action to pending cache for later sync
    caches.open('garagebook-pending').then((cache) => {
      const request = new Request(event.data.url, {
        method: event.data.method || 'POST',
        body: JSON.stringify(event.data.body),
        headers: { 'Content-Type': 'application/json' },
      })
      cache.put(request, new Response(JSON.stringify(event.data.body)))
    })
  }

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
