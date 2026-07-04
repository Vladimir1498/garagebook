import { Users } from 'lucide-react'
import type { Organization } from '../../types/organization.types'

interface FleetCardProps {
  fleet: Organization
  onClick: () => void
}

export default function FleetCard({ fleet, onClick }: FleetCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-surface-700 dark:bg-surface-800"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-surface-900 dark:text-white">{fleet.name}</h3>
          <p className="text-sm text-surface-500">Создана {new Date(fleet.created_at).toLocaleDateString('ru')}</p>
        </div>
      </div>
    </div>
  )
}
