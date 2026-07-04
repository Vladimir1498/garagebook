import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Car, Wrench, DollarSign, FileText, Bell, BarChart3, Shield, ClipboardCheck } from 'lucide-react'
import { analyticsService } from '../../services/analytics.service'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/dashboard/StatCard'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import UpcomingEvents from '../../components/dashboard/UpcomingEvents'
import Skeleton from '../../components/ui/Skeleton'
import InstallPrompt from '../../components/pwa/InstallPrompt'
import UpdateBanner from '../../components/pwa/UpdateBanner'
import CommandPalette from '../../components/ui/CommandPalette'

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Замена масла', filter: 'Замена фильтра', spark_plugs: 'Свечи',
  brakes: 'Тормоза', suspension: 'Подвеска', timing_belt: 'ГРМ',
  engine_repair: 'Двигатель', custom: 'Другое',
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => analyticsService.dashboard() })

  const d = data?.data

  // Format activity with translated service types
  const recentActivity = (d?.recent_activity || []).map((a) => ({
    ...a,
    title: serviceTypeLabels[a.service_type] || a.service_type,
  }))

  // Next service
  const nextServiceText = d?.next_service
    ? `${d.next_service.car} — ${serviceTypeLabels[d.next_service.type] || d.next_service.type} (≈${d.next_service.mileage.toLocaleString('ru')} км)`
    : '—'

  // Insurance status
  let insuranceText = 'Нет данных'
  if (d?.insurance_expiring) {
    const days = d.insurance_expiring.days_left
    if (days <= 0) insuranceText = `Истекла!`
    else if (days <= 30) insuranceText = `${d.insurance_expiring.car} — осталось ${days} дн.`
    else insuranceText = `${d.insurance_expiring.car} — до ${new Date(d.insurance_expiring.expiry).toLocaleDateString('ru')}`
  }

  // Inspection status
  let inspectionText = 'Нет данных'
  if (d?.inspection_expiring) {
    const days = d.inspection_expiring.days_left
    if (days <= 0) inspectionText = `Истек!`
    else if (days <= 30) inspectionText = `${d.inspection_expiring.car} — осталось ${days} дн.`
    else inspectionText = `${d.inspection_expiring.car} — до ${new Date(d.inspection_expiring.expiry).toLocaleDateString('ru')}`
  }

  // Last record
  const lastRecordText = d?.last_record?.type
    ? `${serviceTypeLabels[d.last_record.type] || d.last_record.type}`
    : '—'

  return (
    <PageWrapper title={t('dashboard.title')}>
      <InstallPrompt />
      <UpdateBanner />
      <CommandPalette />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title={t('dashboard.car_count')} value={d?.car_count || 0} icon={<Car className="h-5 w-5" />} />
            <StatCard title={t('dashboard.monthly_expenses')} value={`${Number(d?.monthly_expenses || 0).toLocaleString('ru')} ₽`} icon={<DollarSign className="h-5 w-5" />} />
            <StatCard title={t('dashboard.next_service')} value={nextServiceText} icon={<Wrench className="h-5 w-5" />} />
            <StatCard title={t('dashboard.insurance_expiring')} value={insuranceText} icon={<Shield className="h-5 w-5" />} />
            <StatCard title={t('dashboard.inspection_expiring')} value={inspectionText} icon={<ClipboardCheck className="h-5 w-5" />} />
            <StatCard title={t('dashboard.last_record')} value={lastRecordText} icon={<BarChart3 className="h-5 w-5" />} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuickActions />
            <UpcomingEvents items={d?.upcoming_events || []} />
          </div>

          <div className="mt-6">
            <RecentActivity items={recentActivity} />
          </div>
        </>
      )}
    </PageWrapper>
  )
}
