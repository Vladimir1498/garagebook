import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '../services/documents.service'

export function useDocumentsList(carId?: string) {
  return useQuery({
    queryKey: ['documents', carId || 'all'],
    queryFn: () => documentsService.list(carId || undefined),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ carId, file, category, name }: { carId: string; file: File; category: string; name: string }) =>
      documentsService.upload(carId, file, category, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}
