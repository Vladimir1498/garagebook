import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: string) => void
  isLoading?: boolean
}

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'viewer', label: 'Наблюдатель' },
]

export default function InviteModal({ isOpen, onClose, onInvite, isLoading }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInvite(email, role)
    setEmail('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Пригласить участника">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@example.com" />
        <Select label="Роль" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>Отмена</Button>
          <Button type="submit" loading={isLoading}>Пригласить</Button>
        </div>
      </form>
    </Modal>
  )
}
