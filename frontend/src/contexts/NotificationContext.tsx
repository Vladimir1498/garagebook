import { createContext, type ReactNode } from 'react'
import { useNotifications as useNotificationsHook } from '../hooks/useNotifications'

interface NotificationContextType {
  notifications: import('../types/notification.types').Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const NotificationContext = createContext<NotificationContextType>({ notifications: [], unreadCount: 0, markAsRead: () => {}, markAllAsRead: () => {} })

export function NotificationProvider({ children }: { children: ReactNode }) {
  const value = useNotificationsHook()
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
