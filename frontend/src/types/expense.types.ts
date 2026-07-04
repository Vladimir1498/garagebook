export type ExpenseCategory = 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'tax' | 'parking' | 'fine' | 'wash' | 'tires' | 'other'

export interface Expense {
  id: string
  car_id: string
  category: ExpenseCategory
  amount: number
  date: string
  description: string | null
  receipt_url: string | null
  created_at: string
}

export interface ExpenseCreate {
  car_id: string
  category: ExpenseCategory
  amount: number
  date: string
  description?: string
  receipt_url?: string
}
