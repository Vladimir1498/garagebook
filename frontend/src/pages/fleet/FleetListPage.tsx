import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Users, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fleetService } from '../../services/fleet.service'
import PageWrapper from '../../components/layout/PageWrapper'
import FleetCard from '../../components/fleet/FleetCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function FleetListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['fleets'],
    queryFn: () => fleetService.list(),
  })
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const isLocked = (error as any)?.response?.status === 403
  const fleets = data?.data || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fleetService.create(name)
      toast.success('Организация создана')
      qc.invalidateQueries({ queryKey: ['fleets'] })
      setShowCreate(false)
      setName('')
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Автопарк доступен на тарифе Fleet')
        navigate('/pricing')
      } else {
        toast.error(err.response?.data?.detail || 'Ошибка')
      }
    } finally { setLoading(false) }
  }

  if (isLocked) {
    return (
      <PageWrapper title={t('fleet.title')}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-2xl bg-primary-50 p-4 dark:bg-primary-900/20">
            <Lock className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Автопарк доступен на тарифе Fleet</h2>
          <p className="mt-2 max-w-md text-sm text-surface-500">
            Управляйте несколькими автомобилями и приглашайте участников
          </p>
          <Button className="mt-6" onClick={() => navigate('/pricing')}>Смотреть тарифы</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={t('fleet.title')} action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />{t('fleet.create')}</Button>}>
      {isLoading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : fleets.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="Нет организаций" description="Создайте организацию для управления автопарком" />
      ) : (
        <div className="space-y-3">
          {fleets.map((f) => <FleetCard key={f.id} fleet={f} onClick={() => navigate(`/fleet/${f.id}`)} />)}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Новая организация" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Название организации" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button type="submit" loading={loading}>{t('common.save')}</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
