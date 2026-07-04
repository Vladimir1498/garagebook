import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesService } from '../services/expenses.service'
import type { ExpenseCreate } from '../types/expense.types'

export function useExpensesList(params?: Record<string, string | number>) {
  return useQuery({ queryKey: ['expenses', params], queryFn: () => expensesService.list(params) })
}

export function useExpense(id: string) {
  return useQuery({ queryKey: ['expense', id], queryFn: () => expensesService.get(id), enabled: !!id })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseCreate) => expensesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expensesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
