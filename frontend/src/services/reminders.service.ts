import api from './api'
import type { Reminder, ReminderCreate } from '../types/reminder.types'
import type { PaginatedResponse } from '../types/common.types'

export const remindersService = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Reminder>>('/api/v1/reminders', { params }),
  get: (id: string) => api.get<Reminder>(`/api/v1/reminders/${id}`),
  create: (data: ReminderCreate) => api.post<Reminder>('/api/v1/reminders', data),
  update: (id: string, data: Partial<ReminderCreate>) =>
    api.patch<Reminder>(`/api/v1/reminders/${id}`, data),
  complete: (id: string) => api.post<Reminder>(`/api/v1/reminders/${id}/complete`),
  delete: (id: string) => api.delete(`/api/v1/reminders/${id}`),
}
