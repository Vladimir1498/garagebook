import { useTranslation } from 'react-i18next'
import { useSubscription } from '../../hooks/useSubscription'
import { paymentService } from '../../services/payment.service'
import PageWrapper from '../../components/layout/PageWrapper'
import PricingCard from '../../components/payments/PricingCard'
import Skeleton from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const { t } = useTranslation()
  const { data: subData, isLoading } = useSubscription()
  const sub = subData?.data

  const handleSelect = async (tier: string) => {
    try {
      const { data } = await paymentService.createCheckout(tier)
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ошибка')
    }
  }

  return (
    <PageWrapper title={t('pricing.title')} subtitle={sub ? `Текущий план: ${sub.tier}` : undefined}>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <PricingCard
            name="Бесплатный"
            price="0"
            period={t('pricing.month')}
            features={['1 автомобиль', 'Базовое ТО', '5 документов', 'Напоминания']}
            isCurrent={sub?.tier === 'free'}
            onSelect={() => {}}
          />
          <PricingCard
            name="Про"
            price="199"
            period={`₽${t('pricing.month')}`}
            features={['Безлимит авто', 'Полная аналитика', 'Экспорт PDF', 'Приоритетная поддержка', 'OCR чеков']}
            isCurrent={sub?.tier === 'pro'}
            isPopular
            onSelect={() => handleSelect('pro')}
          />
          <PricingCard
            name="Флит"
            price="999"
            period={`₽${t('pricing.month')}`}
            features={['Всё из "Про"', 'Флит-режим', 'API доступ', 'Совместный доступ', 'Fleet аналитика']}
            isCurrent={sub?.tier === 'fleet'}
            onSelect={() => handleSelect('fleet')}
          />
        </div>
      )}
    </PageWrapper>
  )
}
