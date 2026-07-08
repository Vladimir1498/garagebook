import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { CommandPaletteProvider } from './contexts/CommandPaletteContext'
import { OfflineProvider } from './contexts/OfflineContext'
import './i18n'
import './index.css'

// Global error handler — prevents white screen in Safari
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason)
  e.preventDefault()
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', padding: 20, textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Что-то пошло не так</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>Попробуйте перезагрузить страницу</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 24px', borderRadius: 8, background: '#2563EB', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer' }}>
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <NotificationProvider>
                  <CommandPaletteProvider>
                    <OfflineProvider>
                      <App />
                      <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'var(--toast-bg)',
                          color: 'var(--toast-color)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                          border: '1px solid var(--border)',
                        },
                        success: {
                          iconTheme: { primary: '#059669', secondary: '#ECFDF5' },
                        },
                        error: {
                          iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' },
                        },
                      }}
                    />
                    </OfflineProvider>
                  </CommandPaletteProvider>
                </NotificationProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
