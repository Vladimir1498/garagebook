import { createContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setIsLoading(false); return }
    authService.me().then(({ data }) => setUser(data)).catch(() => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }).finally(() => setIsLoading(false))
  }, [])

  const login = async (data: LoginRequest) => {
    const { data: tokens } = await authService.login(data)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const { data: me } = await authService.me()
    setUser(me)
  }

  const register = async (data: RegisterRequest) => {
    const { data: tokens } = await authService.register(data)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const { data: me } = await authService.me()
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
