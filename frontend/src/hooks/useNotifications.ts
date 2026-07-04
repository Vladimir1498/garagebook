import { useState, useEffect } from 'react'
import api from '../services/api'
import type { Notification } from '../types/notification.types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get<Notification[]>('/api/v1/notifications')
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch {}
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAsRead = async (id: string) => {
    await api.post(`/api/v1/notifications/${id}/read`)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    await api.post('/api/v1/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
