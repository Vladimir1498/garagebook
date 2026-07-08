import axios from 'axios'
import { cacheResponse, getCachedResponse, queueAction } from '../utils/offlineQueue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processRefreshQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)))
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  async (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const key = `get:${response.config.url}`
      await cacheResponse(key, response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // ── Offline: cache GETs, queue mutations ──
    if (!navigator.onLine && originalRequest && !originalRequest._offlineHandled) {
      originalRequest._offlineHandled = true

      // GET → try cache
      if (originalRequest.method === 'get') {
        const key = `get:${originalRequest.url}`
        const cached = await getCachedResponse(key)
        if (cached) {
          return { data: cached, status: 200, statusText: 'OK (cached)', config: originalRequest, headers: {} }
        }
        return Promise.reject({ ...error, message: 'Оффлайн: данные не в кеше' })
      }

      // POST / PATCH / PUT / DELETE → queue
      const method = originalRequest.method?.toUpperCase()
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
        const fullUrl = `${api.defaults.baseURL}${originalRequest.url || ''}`
        let body = originalRequest.data
        if (body && typeof body !== 'string') {
          body = JSON.stringify(body)
        }
        await queueAction(fullUrl, method, body ? JSON.parse(body) : null)
        return {
          data: { data: null, offline: true },
          status: 200,
          statusText: 'Queued offline',
          config: originalRequest,
          headers: {},
        }
      }
    }

    // ── Token refresh ──
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
        processRefreshQueue(null, data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (e) {
        processRefreshQueue(e, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
