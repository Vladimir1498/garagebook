import { useState, useCallback } from 'react'
import api from '../services/api'
import type { Car } from '../types/car.types'
import type { MaintenanceRecord } from '../types/maintenance.types'
import type { Expense } from '../types/expense.types'
import type { Document } from '../types/document.types'

interface SearchResult {
  cars: Car[]
  maintenance: MaintenanceRecord[]
  expenses: Expense[]
  documents: Document[]
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setResults(null); return }
    setIsSearching(true)
    try {
      const { data } = await api.get<SearchResult>('/api/v1/search', { params: { q: query } })
      setResults(data)
    } catch { setResults(null) }
    finally { setIsSearching(false) }
  }, [])

  const clearSearch = () => setResults(null)

  return { results, isSearching, search, clearSearch }
}
