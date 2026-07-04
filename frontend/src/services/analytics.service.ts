import api from './api'
import type { AnalyticsData, DashboardData } from '../types/common.types'

export const analyticsService = {
  dashboard: (carId?: string) =>
    api.get<DashboardData>('/api/v1/dashboard', { params: carId ? { car_id: carId } : {} }),
  get: (carId?: string, period?: string) =>
    api.get<AnalyticsData>('/api/v1/analytics', { params: { car_id: carId, period } }),
  exportPdf: (carId: string) =>
    api.get(`/api/v1/cars/${carId}/export`, { responseType: 'blob' }),
}
