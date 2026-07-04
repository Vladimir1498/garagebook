import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '../services/documents.service'

export function useDocumentsList(params?: Record<string, string | number>) {
  return useQuery({ queryKey: ['documents', params], queryFn: () => documentsService.list(params) })
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
