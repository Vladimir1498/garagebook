import api from './api'
import type { Organization, OrganizationMember, OrganizationCar } from '../types/organization.types'

export const fleetService = {
  list: () => api.get<Organization[]>('/api/v1/fleets'),
  get: (id: string) => api.get<Organization>(`/api/v1/fleets/${id}`),
  create: (name: string) => api.post<Organization>('/api/v1/fleets', { name }),
  delete: (id: string) => api.delete(`/api/v1/fleets/${id}`),
  members: (id: string) => api.get<OrganizationMember[]>(`/api/v1/fleets/${id}/members`),
  invite: (id: string, email: string, role: string) =>
    api.post<OrganizationMember>(`/api/v1/fleets/${id}/invite`, { email, role }),
  removeMember: (fleetId: string, memberId: string) =>
    api.delete(`/api/v1/fleets/${fleetId}/members/${memberId}`),
  cars: (id: string) => api.get<OrganizationCar[]>(`/api/v1/fleets/${id}/cars`),
  addCar: (fleetId: string, carId: string) =>
    api.post<OrganizationCar>(`/api/v1/fleets/${fleetId}/cars`, { car_id: carId }),
  removeCar: (fleetId: string, orgCarId: string) =>
    api.delete(`/api/v1/fleets/${fleetId}/cars/${orgCarId}`),
}
