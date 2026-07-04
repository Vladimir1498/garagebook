export type NotificationType = 'reminder' | 'system' | 'maintenance' | 'payment'

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  link: string | null
  created_at: string
}
