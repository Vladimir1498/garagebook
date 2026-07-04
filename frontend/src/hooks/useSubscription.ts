import { useQuery } from '@tanstack/react-query'
import { paymentService } from '../services/payment.service'

export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: () => paymentService.getSubscription() })
}
