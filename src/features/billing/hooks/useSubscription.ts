import { useQuery } from '@tanstack/react-query'
import { billingService } from '../services/billingService'
import { billingKeys } from './cacheKeys'

// data === null significa "sem assinatura" (404 normalizado no service);
// undefined significa "ainda carregando".
export function useSubscription(options?: {
  refetchInterval?: number | false
}) {
  return useQuery({
    queryKey: billingKeys.subscription,
    queryFn: billingService.getSubscription,
    refetchInterval: options?.refetchInterval ?? false,
  })
}
