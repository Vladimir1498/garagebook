import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppLayout from './components/layout/AppLayout'
import Skeleton from './components/ui/Skeleton'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const CarsListPage = lazy(() => import('./pages/cars/CarsListPage'))
const CarDetailPage = lazy(() => import('./pages/cars/CarDetailPage'))
const CarFormPage = lazy(() => import('./pages/cars/CarFormPage'))
const MaintenanceListPage = lazy(() => import('./pages/maintenance/MaintenanceListPage'))
const MaintenanceFormPage = lazy(() => import('./pages/maintenance/MaintenanceFormPage'))
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'))
const ExpenseFormPage = lazy(() => import('./pages/expenses/ExpenseFormPage'))
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage'))
const RemindersPage = lazy(() => import('./pages/reminders/RemindersPage'))
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
const FleetListPage = lazy(() => import('./pages/fleet/FleetListPage'))
const FleetDetailPage = lazy(() => import('./pages/fleet/FleetDetailPage'))
const PricingPage = lazy(() => import('./pages/payments/PricingPage'))
const PublicVehiclePage = lazy(() => import('./pages/public/PublicVehiclePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>}>
      <Routes>
        <Route element={<GuestRoute><LoginPage /></GuestRoute>} path="/login" />
        <Route element={<GuestRoute><RegisterPage /></GuestRoute>} path="/register" />
        <Route element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} path="/forgot-password" />
        <Route element={<PublicVehiclePage />} path="/vehicle/:id" />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="cars" element={<CarsListPage />} />
          <Route path="cars/new" element={<CarFormPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />
          <Route path="maintenance" element={<MaintenanceListPage />} />
          <Route path="maintenance/new" element={<MaintenanceFormPage />} />
          <Route path="maintenance/:id/edit" element={<MaintenanceFormPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="expenses/new" element={<ExpenseFormPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="fleet" element={<FleetListPage />} />
          <Route path="fleet/:id" element={<FleetDetailPage />} />
          <Route path="pricing" element={<PricingPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
