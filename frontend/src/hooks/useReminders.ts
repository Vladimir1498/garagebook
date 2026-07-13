import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { remindersService } from '../services/reminders.service'
import type { ReminderCreate } from '../types/reminder.types'

export function useRemindersList(carId?: string) {
  return useQuery({
    queryKey: ['reminders', carId || 'all'],
    queryFn: () => remindersService.list(carId ? { car_id: carId } : undefined),
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReminderCreate) => remindersService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}

export function useCompleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => remindersService.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}

export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => remindersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}
