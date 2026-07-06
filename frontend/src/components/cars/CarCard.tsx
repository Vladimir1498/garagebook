import { useNavigate } from 'react-router-dom'
import { Gauge, Fuel, Shield } from 'lucide-react'
import type { Car } from '../../types/car.types'
import { resolveFileUrl } from '../../utils/resolveFileUrl'
import { clsx } from 'clsx'
import Badge from '../ui/Badge'

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }

export default function CarCard({ car }: { car: Car }) {
  const navigate = useNavigate()
  const resolvedPhotoUrl = resolveFileUrl(car.photo_url)

  const insuranceDays = car.insurance_expiry
    ? Math.ceil((new Date(car.insurance_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      onClick={() => navigate(`/cars/${car.id}`)}
      className="card-interactive overflow-hidden"
    >
      {/* Photo — no negative margins, fits inside card naturally */}
      <div className="relative -mx-5 -mt-5 mb-4 aspect-[16/10] overflow-hidden sm:-mx-5 sm:-mt-5">
        {resolvedPhotoUrl ? (
          <img
            src={resolvedPhotoUrl}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-100 dark:bg-surface-700/50">
            <span className="text-4xl opacity-30">🚗</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-surface-800 backdrop-blur-sm dark:bg-surface-900/90 dark:text-surface-100">
          {car.year}
        </span>
      </div>

      {/* Info */}
      <div className="px-5 pb-1">
        <h3 className="text-[15px] font-semibold tracking-tight text-surface-900 dark:text-white">
          {car.brand} {car.model}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-surface-500 dark:text-surface-400">
          <span className="flex items-center gap-1 tabular-nums">
            <Gauge className="h-3.5 w-3.5 text-surface-400" strokeWidth={1.5} />
            {car.mileage.toLocaleString('ru')} км
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5 text-surface-400" strokeWidth={1.5} />
            {fuelLabels[car.fuel_type]}
          </span>
          {insuranceDays !== null && (
            <Badge
              variant={insuranceDays <= 0 ? 'danger' : insuranceDays <= 30 ? 'warning' : 'default'}
              size="sm"
            >
              <Shield className="h-3 w-3" strokeWidth={1.5} />
              {insuranceDays <= 0 ? 'Истекла' : `${insuranceDays} дн.`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
