export type ServiceType = 'oil_change' | 'filter' | 'spark_plugs' | 'brakes' | 'suspension' | 'timing_belt' | 'engine_repair' | 'custom'

export interface MaintenanceRecord {
  id: string
  car_id: string
  service_type: ServiceType
  custom_type: string | null
  date: string
  mileage: number
  cost: number
  description: string | null
  service_center: string | null
  photo_url: string | null
  receipt_url: string | null
  created_at: string
}

export interface MaintenanceCreate {
  car_id: string
  service_type: ServiceType
  custom_type?: string
  date: string
  mileage: number
  cost: number
  description?: string
  service_center?: string
  photo_url?: string
  receipt_url?: string
}
