export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  detail: string
  code?: string
}

export interface DashboardData {
  next_service: { car: string; mileage: number; type: string; date: string } | null
  insurance_expiring: { car: string; expiry: string; days_left: number } | null
  inspection_expiring: { car: string; expiry: string; days_left: number } | null
  monthly_expenses: number
  last_record: { type: string; car: string; date: string } | null
  car_count: number
  recent_activity: Array<{ id: string; type: string; service_type: string; date: string; car: string }>
  upcoming_events: Array<{ title: string; date: string; car: string; type: string }>
}

export interface AnalyticsData {
  monthly_expenses: Array<{ month: string; total: number }>
  yearly_expenses: Array<{ year: string; total: number }>
  category_breakdown: Array<{ category: string; total: number; count: number }>
  cost_per_km: number
  total_expenses: number
  avg_service_cost: number
  most_expensive_repair: { description: string; cost: number; date: string } | null
  ownership_cost: number
}
