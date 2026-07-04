import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Users } from 'lucide-react'
import { useFleets } from '../../hooks/useFleet'
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
  const { data, isLoading } = useFleets()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

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
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Ошибка') }
    finally { setLoading(false) }
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
