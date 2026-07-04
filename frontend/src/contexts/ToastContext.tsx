import { createContext, type ReactNode } from 'react'
import toast from 'react-hot-toast'

interface ToastContextType {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

export const ToastContext = createContext<ToastContextType>({ success: () => {}, error: () => {}, info: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const value: ToastContextType = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg),
  }
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
