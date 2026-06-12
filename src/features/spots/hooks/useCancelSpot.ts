import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'
import type { Spot } from '../types'

type ViewportSnapshot = Array<[QueryKey, Spot[] | undefined]>

// Cancelamento com optimistic remove dos balões (todas as variações de
// viewport) — padrão canônico de CLAUDE.md. DELETE é idempotente no backend.
export function useCancelSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => spotsService.cancel(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: spotKeys.viewportAll })
      const prev: ViewportSnapshot = queryClient.getQueriesData<Spot[]>({
        queryKey: spotKeys.viewportAll,
      })
      queryClient.setQueriesData<Spot[]>(
        { queryKey: spotKeys.viewportAll },
        old => old?.filter(spot => spot.id !== id),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: spotKeys.detail(id) })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: spotKeys.viewportAll })
    },
  })
}
