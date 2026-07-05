import { useNavigate } from 'react-router-dom'
import { Fuel, Gauge, Calendar } from 'lucide-react'
import type { Car } from '../../types/car.types'
import { resolveFileUrl } from '../../utils/resolveFileUrl'

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }

export default function CarCard({ car }: { car: Car }) {
  const navigate = useNavigate()
  const resolvedPhotoUrl = resolveFileUrl(car.photo_url)

  return (
    <div
      onClick={() => navigate(`/cars/${car.id}`)}
      className="group cursor-pointer rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-surface-700 dark:bg-surface-800"
    >
      {resolvedPhotoUrl ? (
        <div className="mb-4 h-40 overflow-hidden rounded-xl">
          <img src={resolvedPhotoUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      ) : (
        <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-700">
          <span className="text-4xl">🚗</span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{car.brand} {car.model}</h3>
      <p className="mt-1 text-sm text-surface-500">{car.year}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{car.mileage.toLocaleString('ru')} км</span>
        <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{fuelLabels[car.fuel_type]}</span>
      </div>
      {car.license_plate && <p className="mt-2 text-xs font-medium text-surface-600 dark:text-surface-400">{car.license_plate}</p>}
    </div>
  )
}
