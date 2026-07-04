const DB_NAME = 'garagebook-offline'
const DB_VERSION = 1
const QUEUE_STORE = 'pending-actions'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface PendingAction {
  id?: number
  url: string
  method: string
  body: any
  timestamp: number
  synced: boolean
}

export async function queueAction(url: string, method: string, body: any): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(QUEUE_STORE, 'readwrite')
  tx.objectStore(QUEUE_STORE).add({
    url, method, body,
    timestamp: Date.now(),
    synced: false,
  })
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  // Register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready
    await (reg as any).sync.register('sync-pending')
  }
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await openDB()
  const tx = db.transaction(QUEUE_STORE, 'readonly')
  const result = await new Promise<PendingAction[]>((resolve, reject) => {
    const req = tx.objectStore(QUEUE_STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return result.filter((a) => !a.synced)
}

export async function markSynced(ids: number[]): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(QUEUE_STORE, 'readwrite')
  const store = tx.objectStore(QUEUE_STORE)
  for (const id of ids) {
    const req = store.get(id)
    req.onsuccess = () => {
      const item = req.result
      if (item) { item.synced = true; store.put(item) }
    }
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function clearSynced(): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(QUEUE_STORE, 'readwrite')
  const store = tx.objectStore(QUEUE_STORE)
  const req = store.openCursor()
  req.onsuccess = () => {
    const cursor = req.result
    if (cursor) {
      if (cursor.value.synced) cursor.delete()
      cursor.continue()
    }
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncPendingActions(): Promise<{ synced: number; failed: number }> {
  const actions = await getPendingActions()
  let synced = 0
  let failed = 0
  const syncedIds: number[] = []

  for (const action of actions) {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(action.url, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(action.body),
      })
      if (response.ok) {
        synced++
        if (action.id) syncedIds.push(action.id)
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  if (syncedIds.length > 0) await markSynced(syncedIds)
  await clearSynced()

  return { synced, failed }
}

export async function getPendingCount(): Promise<number> {
  const actions = await getPendingActions()
  return actions.length
}
