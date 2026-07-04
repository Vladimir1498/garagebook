import { useQuery } from '@tanstack/react-query'
import { fleetService } from '../services/fleet.service'

export function useFleets() {
  return useQuery({ queryKey: ['fleets'], queryFn: () => fleetService.list() })
}

export function useFleet(id: string) {
  return useQuery({ queryKey: ['fleet', id], queryFn: () => fleetService.get(id), enabled: !!id })
}

export function useFleetMembers(id: string) {
  return useQuery({ queryKey: ['fleet-members', id], queryFn: () => fleetService.members(id), enabled: !!id })
}

export function useFleetCars(id: string) {
  return useQuery({ queryKey: ['fleet-cars', id], queryFn: () => fleetService.cars(id), enabled: !!id })
}
