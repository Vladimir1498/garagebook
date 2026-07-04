import { useQuery } from '@tanstack/react-query'
import { Shield, Users, Car, Wrench, DollarSign, Eye } from 'lucide-react'
import api from '../../services/api'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/dashboard/StatCard'
import Skeleton from '../../components/ui/Skeleton'
import { useState } from 'react'

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/v1/admin/stats'),
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/v1/admin/users'),
  })

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => api.get('/api/v1/admin/cars'),
  })

  const [tab, setTab] = useState<'stats' | 'users' | 'cars'>('stats')
  const s = stats?.data

  return (
    <PageWrapper title="Админ-панель" subtitle="Управление системой">
      <div className="mb-4 flex gap-2">
        {(['stats', 'users', 'cars'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300'}`}>
            {t === 'stats' ? 'Статистика' : t === 'users' ? 'Пользователи' : 'Автомобили'}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        statsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : s ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Пользователей" value={s.user_count} icon={<Users className="h-5 w-5" />} />
            <StatCard title="Автомобилей" value={s.car_count} icon={<Car className="h-5 w-5" />} />
            <StatCard title="Записей ТО" value={s.maintenance_count} icon={<Wrench className="h-5 w-5" />} />
            <StatCard title="Общий оборот" value={`${Number(s.total_revenue).toLocaleString('ru')} ₽`} icon={<DollarSign className="h-5 w-5" />} />
          </div>
        ) : null
      )}

      {tab === 'users' && (
        usersLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-2">
            {(users?.data || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">{u.full_name?.charAt(0) || '?'}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{u.full_name}</p>
                  <p className="text-xs text-surface-500">{u.email}</p>
                </div>
                {u.is_admin && <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">Админ</span>}
                <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.is_active ? 'Активен' : 'Заблокирован'}</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'cars' && (
        carsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-2">
            {(cars?.data || []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-600 dark:bg-surface-700"><Car className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{c.brand} {c.model}</p>
                  <p className="text-xs text-surface-500">{c.year} · {c.mileage?.toLocaleString('ru')} км</p>
                </div>
              </div>
            ))}
            {(cars?.data || []).length === 0 && <p className="py-8 text-center text-surface-500">Нет автомобилей</p>}
          </div>
        )
      )}
    </PageWrapper>
  )
}
