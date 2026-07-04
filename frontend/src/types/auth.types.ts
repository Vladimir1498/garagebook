export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  auth_provider: 'local' | 'google' | 'apple'
  is_active: boolean
  is_admin: boolean
  language: string
  theme: 'light' | 'dark' | 'system'
  timezone: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}
