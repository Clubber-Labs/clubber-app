import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query'
import { feedKey } from '@/features/events/hooks/cacheKeys'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import { spotsService } from '../services/spotsService'
import { spotKeys, spotListKeys } from './cacheKeys'
import type { FeedItem } from '@/features/feed/types'
import type { CursorPaginatedResponse } from '@/shared/types'
import type { Spot } from '../types'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedItem>>
type Snapshot<T> = Array<[QueryKey, T | undefined]>

/**
 * Cancelamento com optimistic remove do rolê nas duas listagens — padrão
 * canônico de CLAUDE.md. DELETE é idempotente no backend.
 *
 * Os caches não têm o mesmo formato: o do mapa é um array plano de Spot, o do
 * feed são páginas de cursor com eventos e rolês misturados. Um filter só não
 * serve pros dois.
 */
export function useCancelSpot(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => spotsService.cancel(id),
    onMutate: async () => {
      await Promise.all(
        spotListKeys.map(key => queryClient.cancelQueries({ queryKey: key })),
      )

      const prevViewport: Snapshot<Spot[]> = queryClient.getQueriesData<Spot[]>(
        { queryKey: spotKeys.viewportAll },
      )
      queryClient.setQueriesData<Spot[]>(
        { queryKey: spotKeys.viewportAll },
        old => old?.filter(spot => spot.id !== id),
      )

      const prevFeed: Snapshot<FeedCache> =
        queryClient.getQueriesData<FeedCache>({ queryKey: feedKey })
      queryClient.setQueriesData<FeedCache>({ queryKey: feedKey }, old =>
        removeFromInfiniteList(old, id),
      )

      return { prevViewport, prevFeed }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prevViewport.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      )
      ctx?.prevFeed.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      )
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: spotKeys.detail(id) })
    },
    onSettled: () => {
      for (const key of spotListKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
