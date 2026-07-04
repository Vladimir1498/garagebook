import api from './api'
import type { MaintenanceRecord, MaintenanceCreate } from '../types/maintenance.types'
import type { PaginatedResponse } from '../types/common.types'

export const maintenanceService = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<MaintenanceRecord>>('/api/v1/maintenance', { params }),
  get: (id: string) => api.get<MaintenanceRecord>(`/api/v1/maintenance/${id}`),
  create: (data: MaintenanceCreate) => api.post<MaintenanceRecord>('/api/v1/maintenance', data),
  update: (id: string, data: Partial<MaintenanceCreate>) =>
    api.patch<MaintenanceRecord>(`/api/v1/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/maintenance/${id}`),
}
