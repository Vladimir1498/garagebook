import api from './api'
import type { Car, CarCreate, CarUpdate } from '../types/car.types'
import type { PaginatedResponse } from '../types/common.types'

export const carsService = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Car>>('/api/v1/cars', { params }),
  get: (id: string) => api.get<Car>(`/api/v1/cars/${id}`),
  create: (data: CarCreate) => api.post<Car>('/api/v1/cars', data),
  update: (id: string, data: CarUpdate) => api.patch<Car>(`/api/v1/cars/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/cars/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ photo_url: string }>(`/api/v1/cars/${id}/photo`, form)
  },
}
