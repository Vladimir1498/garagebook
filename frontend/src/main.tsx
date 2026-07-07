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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>
)
