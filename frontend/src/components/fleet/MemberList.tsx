import { Trash2 } from 'lucide-react'
import type { OrganizationMember } from '../../types/organization.types'
import Badge from '../ui/Badge'

const roleColors: Record<string, 'success' | 'info' | 'default'> = {
  owner: 'success',
  admin: 'info',
  viewer: 'default',
}

export default function MemberList({ members, onRemove }: { members: OrganizationMember[]; onRemove: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-3 dark:border-surface-700 dark:bg-surface-800">
          {m.user?.avatar_url ? (
            <img src={m.user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
              {m.user?.full_name?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{m.user?.full_name}</p>
            <p className="truncate text-xs text-surface-500">{m.user?.email}</p>
          </div>
          <Badge variant={roleColors[m.role] || 'default'}>{m.role}</Badge>
          {m.role !== 'owner' && (
            <button onClick={() => onRemove(m.id)} className="rounded-lg p-1 text-surface-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
