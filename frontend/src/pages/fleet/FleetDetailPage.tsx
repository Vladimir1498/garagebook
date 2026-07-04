import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFleet, useFleetMembers } from '../../hooks/useFleet'
import { fleetService } from '../../services/fleet.service'
import PageWrapper from '../../components/layout/PageWrapper'
import MemberList from '../../components/fleet/MemberList'
import InviteModal from '../../components/fleet/InviteModal'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'

export default function FleetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: fleetData, isLoading: fleetLoading, error: fleetError } = useFleet(id!)
  const { data: membersData, isLoading: membersLoading } = useFleetMembers(id!)
  const [showInvite, setShowInvite] = useState(false)

  const fleet = fleetData?.data
  const members = membersData?.data || []
  const isLocked = (fleetError as any)?.response?.status === 403

  const handleInvite = async (email: string, role: string) => {
    try {
      await fleetService.invite(id!, email, role)
      toast.success('Приглашение отправлено')
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Функция доступна на тарифе Fleet')
      } else {
        toast.error(err.response?.data?.detail || 'Ошибка')
      }
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await fleetService.removeMember(id!, memberId)
      toast.success('Участник удален')
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Ошибка') }
  }

  if (fleetLoading) return <Skeleton className="h-64" />

  if (isLocked) {
    return (
      <PageWrapper title="Автопарк" backTo="/fleet">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Lock className="mb-4 h-12 w-12 text-primary-500" />
          <h2 className="text-xl font-bold">Доступно на тарифе Fleet</h2>
          <p className="mt-2 text-sm text-surface-500">Обновите тариф для управления автопарком</p>
          <Button className="mt-6" onClick={() => navigate('/pricing')}>Смотреть тарифы</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={fleet?.name || 'Организация'} backTo="/fleet">
      <div className="space-y-6">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-surface-900 dark:text-white">{t('fleet.members')}</h3>
            <Button size="sm" onClick={() => setShowInvite(true)}>Пригласить</Button>
          </div>
          {membersLoading ? <Skeleton className="h-32" /> : <MemberList members={members} onRemove={handleRemoveMember} />}
        </div>
      </div>

      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} onInvite={handleInvite} />
    </PageWrapper>
  )
}
