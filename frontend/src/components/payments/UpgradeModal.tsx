import Modal from '../ui/Modal'
import PricingCard from './PricingCard'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (tier: string) => void
}

export default function UpgradeModal({ isOpen, onClose, onSelect }: UpgradeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PricingCard name="Бесплатный" price="0" period="/мес" features={['1 автомобиль', 'Базовое ТО', '5 документов']} isCurrent onSelect={() => {}} />
        <PricingCard name="Про" price="199" period="Br/мес" features={['Безлимит авто', 'Аналитика', 'Экспорт PDF', 'Приоритетная поддержка']} isPopular onSelect={() => onSelect('pro')} />
        <PricingCard name="Флит" price="999" period="Br/мес" features={['Всё из "Про"', 'Флит-режим', 'API доступ', 'Совместный доступ']} onSelect={() => onSelect('fleet')} />
      </div>
    </Modal>
  )
}
