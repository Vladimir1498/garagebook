import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carsService } from '../services/cars.service'
import type { CarCreate, CarUpdate } from '../types/car.types'

export function useCars() {
  return useQuery({ queryKey: ['cars'], queryFn: () => carsService.list() })
}

export function useCar(id: string) {
  return useQuery({ queryKey: ['car', id], queryFn: () => carsService.get(id), enabled: !!id })
}

export function useCreateCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CarCreate) => carsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cars'] }),
  })
}

export function useUpdateCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarUpdate }) => carsService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['cars'] })
      qc.invalidateQueries({ queryKey: ['car', id] })
    },
  })
}

export function useDeleteCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => carsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cars'] }),
  })
}

export function useUploadCarPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => carsService.uploadPhoto(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['car', id] })
      qc.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}
