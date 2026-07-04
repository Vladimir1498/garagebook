export type DocumentCategory = 'insurance' | 'sts' | 'diagnostics' | 'work_order' | 'receipt' | 'other'

export interface Document {
  id: string
  car_id: string
  name: string
  category: DocumentCategory
  file_url: string
  file_type: string
  file_size: number
  notes: string | null
  created_at: string
}

export interface DocumentCreate {
  car_id: string
  name: string
  category: DocumentCategory
  notes?: string
}
