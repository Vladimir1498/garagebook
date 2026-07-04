import { createContext, type ReactNode } from 'react'
import { useTheme as useThemeHook } from '../hooks/useTheme'

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void
  isDark: boolean
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'system', setTheme: () => {}, isDark: false })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useThemeHook()
  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
}
