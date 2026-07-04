import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveIsDark(theme: Theme): boolean {
  return theme === 'dark' || (theme === 'system' && getSystemDark())
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })
  const [isDark, setIsDark] = useState(() => resolveIsDark(theme))

  useEffect(() => {
    const root = document.documentElement
    const apply = (t: Theme) => {
      const dark = resolveIsDark(t)
      setIsDark(dark)
      if (dark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    apply(theme)
    localStorage.setItem('theme', theme)
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  return { theme, setTheme, isDark }
}
