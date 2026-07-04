import api from './api'
import type { LoginRequest, RegisterRequest, AuthTokens, User } from '../types/auth.types'

export const authService = {
  login: (data: LoginRequest) => api.post<AuthTokens>('/api/v1/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthTokens>('/api/v1/auth/register', data),
  refresh: (refresh_token: string) => api.post<AuthTokens>('/api/v1/auth/refresh', { refresh_token }),
  logout: () => api.post('/api/v1/auth/logout'),
  googleAuth: (credential: string) => api.post<AuthTokens>('/api/v1/auth/google', { credential }),
  appleAuth: (code: string) => api.post<AuthTokens>('/api/v1/auth/apple', { code }),
  me: () => api.get<User>('/api/v1/users/me'),
  updateProfile: (data: Partial<User>) => api.patch<User>('/api/v1/users/me', data),
}
