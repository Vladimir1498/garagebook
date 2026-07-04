import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceService } from '../services/maintenance.service'
import type { MaintenanceCreate } from '../types/maintenance.types'

export function useMaintenanceList(params?: Record<string, string | number>) {
  return useQuery({ queryKey: ['maintenance', params], queryFn: () => maintenanceService.list(params) })
}

export function useMaintenance(id: string) {
  return useQuery({ queryKey: ['maintenance', id], queryFn: () => maintenanceService.get(id), enabled: !!id })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MaintenanceCreate) => maintenanceService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useUpdateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceCreate> }) => maintenanceService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useDeleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => maintenanceService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}
