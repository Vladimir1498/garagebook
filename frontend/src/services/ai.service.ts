import api from './api'

export const aiService = {
  scanReceipt: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{
      amount: number | null
      date: string | null
      vendor: string | null
      category: string | null
      source: string
    }>('/api/v1/ai/scan-receipt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  scanVin: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{
      vin: string | null
      source: string
    }>('/api/v1/ai/scan-vin', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
