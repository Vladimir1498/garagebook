import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Car, Wrench, DollarSign, FileText, Bell, BarChart3, Shield, ClipboardCheck, ArrowRight } from 'lucide-react'
import { analyticsService } from '../../services/analytics.service'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/dashboard/StatCard'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import UpcomingEvents from '../../components/dashboard/UpcomingEvents'
import Skeleton from '../../components/ui/Skeleton'
import UpdateBanner from '../../components/pwa/UpdateBanner'
import { useAuth } from '../../hooks/useAuth'
import { formatMoney } from '../../utils/formatCurrency'

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Замена масла', filter: 'Замена фильтра', spark_plugs: 'Свечи',
  brakes: 'Тормоза', suspension: 'Подвеска', timing_belt: 'ГРМ',
  engine_repair: 'Двигатель', custom: 'Другое',
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => analyticsService.dashboard() })

  const d = data?.data

  const recentActivity = (d?.recent_activity || []).map((a) => ({
    ...a,
    title: serviceTypeLabels[a.service_type] || a.service_type,
  }))

  const nextServiceText = d?.next_service
    ? `${serviceTypeLabels[d.next_service.type] || d.next_service.type}`
    : '—'

  let insuranceStatus: 'ok' | 'warning' | 'danger' = 'ok'
  let insuranceText = 'Нет данных'
  if (d?.insurance_expiring) {
    const days = d.insurance_expiring.days_left
    if (days <= 0) { insuranceStatus = 'danger'; insuranceText = 'Истекла!' }
    else if (days <= 30) { insuranceStatus = 'warning'; insuranceText = `${days} дн.` }
    else insuranceText = new Date(d.insurance_expiring.expiry).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
  }

  let inspectionStatus: 'ok' | 'warning' | 'danger' = 'ok'
  let inspectionText = 'Нет данных'
  if (d?.inspection_expiring) {
    const days = d.inspection_expiring.days_left
    if (days <= 0) { inspectionStatus = 'danger'; inspectionText = 'Истек!' }
    else if (days <= 30) { inspectionStatus = 'warning'; inspectionText = `${days} дн.` }
    else inspectionText = new Date(d.inspection_expiring.expiry).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Доброе утро'
    if (h < 18) return 'Добрый день'
    return 'Добрый вечер'
  })()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[88px]" />)}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UpdateBanner />

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
          {greeting}, {user?.full_name?.split(' ')[0] || '车主'}
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard title="Автомобилей" value={d?.car_count || 0} icon={<Car className="h-4 w-4" />} />
        <StatCard title="Расходы / мес" value={`${formatMoney(Number(d?.monthly_expenses || 0))}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard title="Следующее ТО" value={d?.next_service ? `${d.next_service.mileage.toLocaleString('ru')} км` : '—'} icon={<Wrench className="h-4 w-4" />} />
        <StatCard title="Записей" value={d?.recent_activity?.length || 0} icon={<BarChart3 className="h-4 w-4" />} />
      </div>

      {/* Alert Cards */}
      {(d?.next_service || d?.insurance_expiring || d?.inspection_expiring) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {d?.next_service && (
            <button
              onClick={() => navigate('/maintenance')}
              className="card-interactive flex items-start gap-3 p-4 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
                <Wrench className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Следующее ТО</p>
                <p className="mt-0.5 truncate text-sm font-medium text-surface-800 dark:text-surface-100">{nextServiceText}</p>
                <p className="mt-0.5 text-xs text-surface-400">{d.next_service.car} · ≈{d.next_service.mileage.toLocaleString('ru')} км</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
            </button>
          )}

          <button
            onClick={() => navigate('/cars')}
            className="card-interactive flex items-start gap-3 p-4 text-left"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              insuranceStatus === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
              : insuranceStatus === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400'
              : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
            }`}>
              <Shield className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Страховка</p>
              <p className="mt-0.5 text-sm font-medium text-surface-800 dark:text-surface-100">{insuranceText}</p>
              {d?.insurance_expiring && <p className="mt-0.5 text-xs text-surface-400">{d.insurance_expiring.car}</p>}
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
          </button>

          <button
            onClick={() => navigate('/cars')}
            className="card-interactive flex items-start gap-3 p-4 text-left"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              inspectionStatus === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
              : inspectionStatus === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400'
              : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
            }`}>
              <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">Техосмотр</p>
              <p className="mt-0.5 text-sm font-medium text-surface-800 dark:text-surface-100">{inspectionText}</p>
              {d?.inspection_expiring && <p className="mt-0.5 text-xs text-surface-400">{d.inspection_expiring.car}</p>}
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
          </button>
        </div>
      )}

      {/* Quick Actions + Events */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickActions />
        <UpcomingEvents items={d?.upcoming_events || []} />
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  )
}
