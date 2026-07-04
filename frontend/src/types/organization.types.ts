export type OrganizationRole = 'owner' | 'admin' | 'viewer'

export interface Organization {
  id: string
  name: string
  owner_id: string
  logo_url: string | null
  created_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  created_at: string
  user?: { id: string; full_name: string; email: string; avatar_url: string | null }
}

export interface OrganizationCar {
  id: string
  organization_id: string
  car_id: string
  created_at: string
  car?: { id: string; brand: string; model: string; year: number }
}
