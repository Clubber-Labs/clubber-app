import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'
import type { Spot } from '../types'

type ListSnapshot = Array<[QueryKey, Spot[] | undefined]>

// Cancelamento com optimistic remove do rolê nas duas listagens (balões do mapa
// e cards do feed) — padrão canônico de CLAUDE.md. DELETE é idempotente no
// backend.
export function useCancelSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => spotsService.cancel(id),
    onMutate: async () => {
      const prev: ListSnapshot = []
      for (const key of spotKeys.listAll) {
        await queryClient.cancelQueries({ queryKey: key })
        prev.push(...queryClient.getQueriesData<Spot[]>({ queryKey: key }))
        queryClient.setQueriesData<Spot[]>({ queryKey: key }, old =>
          old?.filter(spot => spot.id !== id),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: spotKeys.detail(id) })
    },
    onSettled: () => {
      for (const key of spotKeys.listAll) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
