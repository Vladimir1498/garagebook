export type ReminderType = 'mileage' | 'date' | 'custom'

export interface Reminder {
  id: string
  car_id: string
  title: string
  reminder_type: ReminderType
  trigger_mileage: number | null
  trigger_date: string | null
  is_recurring: boolean
  recurring_km: number | null
  recurring_months: number | null
  notify_push: boolean
  notify_email: boolean
  is_completed: boolean
  created_at: string
}

export interface ReminderCreate {
  car_id: string
  title: string
  reminder_type: ReminderType
  trigger_mileage?: number
  trigger_date?: string
  is_recurring?: boolean
  recurring_km?: number
  recurring_months?: number
  notify_push?: boolean
  notify_email?: boolean
}
