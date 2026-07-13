import api from './api'
import type { Document, DocumentCreate } from '../types/document.types'
import type { PaginatedResponse } from '../types/common.types'

export const documentsService = {
  list: (carId?: string) =>
    api.get<PaginatedResponse<Document>>('/api/v1/documents', {
      params: carId ? { car_id: carId } : {},
    }),
  get: (id: string) => api.get<Document>(`/api/v1/documents/${id}`),
  create: (data: DocumentCreate) => api.post<Document>('/api/v1/documents', data),
  upload: (carId: string, file: File, category: string, name: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('car_id', carId)
    form.append('category', category)
    form.append('name', name)
    return api.post<Document>('/api/v1/documents/upload', form)
  },
  delete: (id: string) => api.delete(`/api/v1/documents/${id}`),
}
