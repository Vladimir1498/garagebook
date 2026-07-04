import { createContext, type ReactNode } from 'react'
import { useOfflineSync } from '../hooks/useOfflineSync'

interface OfflineContextType {
  isOnline: boolean
  pendingCount: number
  syncing: boolean
  syncPending: () => void
  offlineRequest: (url: string, method: string, body?: any) => Promise<any>
}

export const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  pendingCount: 0,
  syncing: false,
  syncPending: () => {},
  offlineRequest: async () => ({}),
})

export function OfflineProvider({ children }: { children: ReactNode }) {
  const value = useOfflineSync()
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
}
