import Badge from '../ui/Badge'
import type { SubscriptionTier } from '../../types/subscription.types'

const tierConfig: Record<SubscriptionTier, { label: string; variant: 'default' | 'success' | 'info' }> = {
  free: { label: 'Free', variant: 'default' },
  pro: { label: 'Pro', variant: 'info' },
  fleet: { label: 'Fleet', variant: 'success' },
}

export default function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  const config = tierConfig[tier] || tierConfig.free
  return <Badge variant={config.variant} size="md">{config.label}</Badge>
}
