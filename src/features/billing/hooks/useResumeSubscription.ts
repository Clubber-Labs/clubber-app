import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Subscription } from '../types'
import { billingService } from '../services/billingService'
import { billingKeys } from './cacheKeys'

// Desfaz o cancelamento agendado (cancel_at_period_end = false) — espelho
// otimista do useCancelSubscription.
export function useResumeSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billingService.resume,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: billingKeys.subscription })
      const prev = queryClient.getQueryData<Subscription | null>(
        billingKeys.subscription,
      )
      if (prev) {
        queryClient.setQueryData<Subscription>(billingKeys.subscription, {
          ...prev,
          cancelAtPeriodEnd: false,
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
