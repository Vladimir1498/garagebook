export type SubscriptionTier = 'free' | 'pro' | 'fleet'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface Subscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_end: string | null
  created_at: string
  updated_at: string
}
