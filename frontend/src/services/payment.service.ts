import api from './api'
import type { Subscription } from '../types/subscription.types'

export const paymentService = {
  getSubscription: () => api.get<Subscription>('/api/v1/payments/subscription'),
  createCheckout: (tier: string) =>
    api.post<{ url: string }>('/api/v1/payments/checkout', { tier }),
  createPortal: () => api.post<{ url: string }>('/api/v1/payments/portal'),
}
