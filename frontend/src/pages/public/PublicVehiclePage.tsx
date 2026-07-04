import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Fuel, Gauge, Calendar, Wrench } from 'lucide-react'
import api from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }

export default function PublicVehiclePage() {
  const { id } = useParams<{ id: string }>()

  const { data: carData, isLoading: carLoading } = useQuery({
    queryKey: ['public-car', id],
    queryFn: () => api.get(`/api/v1/public/vehicles/${id}`),
  })

  const { data: historyData } = useQuery({
    queryKey: ['public-history', id],
    queryFn: () => api.get(`/api/v1/public/vehicles/${id}/history`),
  })

  const car = carData?.data
  const history = historyData?.data || []

  if (carLoading) return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-8 w-32" /></div>
  if (!car) return <div className="flex min-h-screen items-center justify-center text-surface-500">Автомобиль не найден</div>

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold text-white">G</div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{car.brand} {car.model}</h1>
          <p className="text-surface-500">{car.year}</p>
        </div>

        {car.photo_url && (
          <img src={car.photo_url} alt={car.brand} className="mb-6 w-full rounded-2xl object-cover shadow-card" />
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoCard icon={<Gauge className="h-4 w-4" />} label="Пробег" value={`${car.mileage?.toLocaleString('ru')} км`} />
          <InfoCard icon={<Fuel className="h-4 w-4" />} label="Топливо" value={fuelLabels[car.fuel_type]} />
          <InfoCard icon={<Calendar className="h-4 w-4" />} label="Год" value={String(car.year)} />
          {car.engine_volume && <InfoCard icon={<Gauge className="h-4 w-4" />} label="Двигатель" value={`${car.engine_volume} л`} />}
        </div>

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-surface-900 dark:text-white">История обслуживания</h2>
            <div className="space-y-2">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-700 dark:bg-surface-800">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-500 dark:bg-blue-900/20"><Wrench className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{h.service_type}</p>
                    <p className="text-xs text-surface-500">{new Date(h.date).toLocaleDateString('ru')} · {h.mileage?.toLocaleString('ru')} км</p>
                  </div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{h.cost?.toLocaleString('ru')} ₽</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-surface-400">История предоставлена через GarageBook</p>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
      <div className="flex items-center gap-2 text-surface-400">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-1 font-semibold text-surface-900 dark:text-white">{value}</p>
    </div>
  )
}
