import api from './api'

export const aiService = {
  scanReceipt: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{
      date: string | null
      amount: number | null
      vendor: string | null
      service_type: string | null
      items: Array<{ name: string; price: number }>
    }>('/api/v1/ai/scan-receipt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  scanVin: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{
      vin: string | null
      brand: string | null
      model: string | null
      year: number | null
    }>('/api/v1/ai/scan-vin', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
