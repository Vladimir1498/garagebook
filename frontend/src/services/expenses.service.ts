import api from './api'
import type { Expense, ExpenseCreate } from '../types/expense.types'
import type { PaginatedResponse } from '../types/common.types'

export const expensesService = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Expense>>('/api/v1/expenses', { params }),
  get: (id: string) => api.get<Expense>(`/api/v1/expenses/${id}`),
  create: (data: ExpenseCreate) => api.post<Expense>('/api/v1/expenses', data),
  update: (id: string, data: Partial<ExpenseCreate>) =>
    api.patch<Expense>(`/api/v1/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/expenses/${id}`),
}
