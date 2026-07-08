import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Users, Car, Wrench, DollarSign, TrendingUp, Crown, Ban, CheckCircle, Trash2, ChevronDown, UserCog, BarChart3, Activity } from 'lucide-react'
import api from '../../services/api'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/dashboard/StatCard'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { clsx } from 'clsx'

const tierLabels: Record<string, string> = { free: 'Free', pro: 'Pro', fleet: 'Fleet' }
const tierColors: Record<string, string> = {
  free: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
  pro: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
  fleet: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
}

export default function AdminPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'stats' | 'users' | 'cars'>('stats')

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

  const toggleAdmin = useMutation({
    mutationFn: (userId: string) => api.post(`/api/v1/admin/users/${userId}/toggle-admin`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Права обновлены') },
    onError: () => toast.error('Ошибка'),
  })

  const toggleActive = useMutation({
    mutationFn: (userId: string) => api.post(`/api/v1/admin/users/${userId}/toggle-active`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Статус обновлён') },
    onError: () => toast.error('Ошибка'),
  })

  const setTier = useMutation({
    mutationFn: ({ userId, tier }: { userId: string; tier: string }) =>
      api.post(`/api/v1/admin/users/${userId}/set-tier`, { tier }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Тариф обновлён') },
    onError: () => toast.error('Ошибка'),
  })

  const deleteUser = useMutation({
    mutationFn: (userId: string) => api.delete(`/api/v1/admin/users/${userId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Пользователь удалён') },
    onError: () => toast.error('Ошибка'),
  })

  const s = stats?.data
  const allUsers = users?.data || []
  const allCars = cars?.data || []

  return (
    <PageWrapper title="Админ-панель" subtitle="Управление системой GarageBook">
      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto scrollbar-none rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
        {([
          { id: 'stats', label: 'Статистика', icon: BarChart3 },
          { id: 'users', label: 'Пользователи', icon: Users },
          { id: 'cars', label: 'Автомобили', icon: Car },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              tab === id ? 'bg-white text-primary-600 shadow-sm dark:bg-surface-700 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:text-surface-400'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ Stats ═══ */}
      {tab === 'stats' && (
        statsLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : s ? (
          <div className="space-y-6">
            {/* Main stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard title="Пользователей" value={s.user_count} icon={<Users className="h-5 w-5" />} />
              <StatCard title="Автомобилей" value={s.car_count} icon={<Car className="h-5 w-5" />} />
              <StatCard title="Записей ТО" value={s.maintenance_count} icon={<Wrench className="h-5 w-5" />} />
              <StatCard title="Общий оборот" value={`${Number(s.total_revenue).toLocaleString('ru')} ₽`} icon={<DollarSign className="h-5 w-5" />} />
            </div>

            {/* Tiers + Registrations */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Tiers breakdown */}
              <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Подписки по тарифам
                </h3>
                <div className="space-y-3">
                  {['free', 'pro', 'fleet'].map((tier) => {
                    const count = s.tiers?.[tier] || 0
                    const total = s.user_count || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={tier}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-surface-700 dark:text-surface-300">{tierLabels[tier]}</span>
                          <span className="tabular-nums text-surface-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                          <div className={clsx('h-full rounded-full transition-all', tier === 'fleet' ? 'bg-purple-500' : tier === 'pro' ? 'bg-primary-500' : 'bg-surface-400')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Registrations chart */}
              <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Регистрации за 30 дней
                </h3>
                {s.registrations?.length > 0 ? (
                  <div className="flex items-end gap-1 h-24">
                    {s.registrations.slice(-14).map((r: any, i: number) => {
                      const max = Math.max(...s.registrations.map((x: any) => x.count))
                      const h = max > 0 ? (r.count / max) * 100 : 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] tabular-nums text-surface-400">{r.count}</span>
                          <div className="w-full rounded-t bg-primary-500 transition-all" style={{ height: `${Math.max(h, 4)}%` }} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-xs text-surface-400">Нет данных</p>
                )}
              </div>
            </div>

            {/* Top users */}
            {s.top_users?.length > 0 && (
              <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  Топ пользователей
                </h3>
                <div className="space-y-2">
                  {s.top_users.map((u: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{u.name}</p>
                        <p className="truncate text-xs text-surface-400">{u.email}</p>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-surface-600 dark:text-surface-300">{u.cars} авто</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null
      )}

      {/* ═══ Users ═══ */}
      {tab === 'users' && (
        usersLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-2">
            {allUsers.map((u: any) => (
              <UserRow
                key={u.id}
                user={u}
                onToggleAdmin={() => toggleAdmin.mutate(u.id)}
                onToggleActive={() => toggleActive.mutate(u.id)}
                onSetTier={(tier) => setTier.mutate({ userId: u.id, tier })}
                onDelete={() => { if (confirm(`Удалить ${u.email}?`)) deleteUser.mutate(u.id) }}
              />
            ))}
            {allUsers.length === 0 && <p className="py-12 text-center text-surface-500">Нет пользователей</p>}
          </div>
        )
      )}

      {/* ═══ Cars ═══ */}
      {tab === 'cars' && (
        carsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <div className="space-y-2">
            {allCars.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-600 dark:bg-surface-700"><Car className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{c.brand} {c.model}</p>
                  <p className="text-xs text-surface-500">{c.year} · {c.mileage?.toLocaleString('ru')} км</p>
                </div>
              </div>
            ))}
            {allCars.length === 0 && <p className="py-12 text-center text-surface-500">Нет автомобилей</p>}
          </div>
        )
      )}
    </PageWrapper>
  )
}


function UserRow({ user: u, onToggleAdmin, onToggleActive, onSetTier, onDelete }: {
  user: any
  onToggleAdmin: () => void
  onToggleActive: () => void
  onSetTier: (tier: string) => void
  onDelete: () => void
}) {
  const [showTierMenu, setShowTierMenu] = useState(false)

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
          {u.full_name?.charAt(0) || '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{u.full_name}</p>
            {u.is_admin && <Shield className="h-3.5 w-3.5 shrink-0 text-primary-500" />}
          </div>
          <p className="truncate text-xs text-surface-500">{u.email}</p>
        </div>

        {/* Tier badge — desktop */}
        <span className={clsx('hidden sm:inline-flex shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-semibold', tierColors[u.tier] || tierColors.free)}>
          {tierLabels[u.tier] || 'Free'}
        </span>
      </div>

      {/* Bottom row: tier (mobile) + actions */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface-100 pt-3 dark:border-surface-700 sm:border-0 sm:pt-0 sm:mt-2">
        {/* Tier badge — mobile */}
        <span className={clsx('sm:hidden shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-semibold', tierColors[u.tier] || tierColors.free)}>
          {tierLabels[u.tier] || 'Free'}
        </span>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Tier dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTierMenu(!showTierMenu)}
              className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
              title="Сменить тариф"
            >
              <Crown className="h-4 w-4" />
            </button>
            {showTierMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-xl border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-600 dark:bg-surface-800">
                {['free', 'pro', 'fleet'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => { onSetTier(tier); setShowTierMenu(false) }}
                    className={clsx(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-surface-50 dark:hover:bg-surface-700',
                      u.tier === tier ? 'text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-surface-300'
                    )}
                  >
                    {u.tier === tier && <CheckCircle className="h-3 w-3" />}
                    {tierLabels[tier]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleAdmin}
            className={clsx('rounded-lg p-2 transition-colors', u.is_admin ? 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700')}
            title={u.is_admin ? 'Снять админа' : 'Сделать админом'}
          >
            <UserCog className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleActive}
            className={clsx('rounded-lg p-2 transition-colors', u.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30')}
            title={u.is_active ? 'Заблокировать' : 'Разблокировать'}
          >
            {u.is_active ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
