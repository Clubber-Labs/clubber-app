import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Subscription } from '../types'
import { billingService } from '../services/billingService'
import { billingKeys } from './cacheKeys'

// Cancelamento é "ao fim do período" (cancel_at_period_end) — otimista com
// revert: o card mostra o aviso de cancelamento na hora e volta se falhar.
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billingService.cancel,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: billingKeys.subscription })
      const prev = queryClient.getQueryData<Subscription | null>(
        billingKeys.subscription,
      )
      if (prev) {
        queryClient.setQueryData<Subscription>(billingKeys.subscription, {
          ...prev,
          cancelAtPeriodEnd: true,
        })
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(billingKeys.subscription, ctx.prev)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription }),
  })
}
