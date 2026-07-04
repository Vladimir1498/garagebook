import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

interface TierLockProps {
  tier: 'pro' | 'fleet'
  feature: string
}

const tierNames = { pro: 'Pro', fleet: 'Fleet' }
const tierPrices = { pro: '199 ₽/мес', fleet: '999 ₽/мес' }

export default function TierLock({ tier, feature }: TierLockProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-primary-50 p-4 dark:bg-primary-900/20">
        <Lock className="h-12 w-12 text-primary-500" />
      </div>
      <h2 className="text-xl font-bold text-surface-900 dark:text-white">{feature} доступна на тарифе {tierNames[tier]}</h2>
      <p className="mt-2 max-w-md text-sm text-surface-500">
        Обновите тариф до {tierNames[tier]} ({tierPrices[tier]}) для полного доступа к функционалу
      </p>
      <Button className="mt-6" onClick={() => navigate('/pricing')}>
        Смотреть тарифы
      </Button>
    </div>
  )
}
