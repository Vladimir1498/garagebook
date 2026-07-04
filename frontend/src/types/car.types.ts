export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid'
export type Transmission = 'manual' | 'automatic' | 'cvt' | 'robotic'

export interface Car {
  id: string
  user_id: string
  brand: string
  model: string
  year: number
  vin: string | null
  license_plate: string | null
  fuel_type: FuelType
  engine_volume: number | null
  transmission: Transmission
  color: string | null
  mileage: number
  purchase_date: string | null
  photo_url: string | null
  insurance_expiry: string | null
  inspection_expiry: string | null
  created_at: string
  updated_at: string
}

export interface CarCreate {
  brand: string
  model: string
  year: number
  vin?: string
  license_plate?: string
  fuel_type: FuelType
  engine_volume?: number
  transmission: Transmission
  color?: string
  mileage?: number
  purchase_date?: string
  photo_url?: string
  insurance_expiry?: string
  inspection_expiry?: string
}

export type CarUpdate = Partial<CarCreate>
