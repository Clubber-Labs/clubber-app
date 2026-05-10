// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type {
  CursorPaginatedResponse,
  EventDetail,
  FeedEvent,
  ReactionType,
} from '@/shared/types'
import type { InfiniteData, QueryKey } from '@tanstack/react-query'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
// Feed pode ter múltiplas variações cacheadas (por filtro). Operamos em todas
// via setQueriesData/getQueriesData em vez de cache exato.
type FeedSnapshot = Array<[QueryKey, FeedCache | undefined]>

function patchFeedEvent(
  cache: FeedCache | undefined,
  eventId: string,
  patch: (event: FeedEvent) => FeedEvent,
): FeedCache | undefined {
  if (!cache) return cache
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(event =>
        event.id === eventId ? patch(event) : event,
      ),
    })),
  }
}

function patchDetail(
  cache: EventDetail | undefined,
  patch: (event: EventDetail) => EventDetail,
): EventDetail | undefined {
  return cache ? patch(cache) : cache
}

export function useToggleLike(eventId: string) {
  const queryClient = useQueryClient()
  const feedKey = ['feed']
  const detailKey = ['events', eventId]

  return useMutation({
    mutationFn: async (currentReaction: ReactionType | null) => {
      if (currentReaction === 'LIKE') {
        await eventsService.removeReaction(eventId)
        return null
      }
      await eventsService.setReaction(eventId, 'LIKE')
      return 'LIKE' as const
    },
    onMutate: async currentReaction => {
      await queryClient.cancelQueries({ queryKey: feedKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const prevFeeds: FeedSnapshot = queryClient.getQueriesData<FeedCache>({
        queryKey: feedKey,
      })
      const prevDetail = queryClient.getQueryData<EventDetail>(detailKey)

      const willLike = currentReaction !== 'LIKE'
      const reactionDelta = willLike ? 1 : -1
      const nextReaction: ReactionType | null = willLike ? 'LIKE' : null

      queryClient.setQueriesData<FeedCache>({ queryKey: feedKey }, old =>
        patchFeedEvent(old, eventId, event => ({
          ...event,
          userReaction: nextReaction,
          _count: {
            ...event._count,
            reactions: event._count.reactions + reactionDelta,
          },
        })),
      )
      queryClient.setQueryData<EventDetail>(detailKey, old =>
        patchDetail(old, event => ({
          ...event,
          userReaction: nextReaction,
          _count: {
            ...event._count,
            reactions: event._count.reactions + reactionDelta,
          },
        })),
      )

      return { prevFeeds, prevDetail }
    },
    onError: (_err, _vars, context) => {
      context?.prevFeeds.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      )
      if (context?.prevDetail)
        queryClient.setQueryData(detailKey, context.prevDetail)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKey })
      queryClient.invalidateQueries({ queryKey: detailKey })
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] as const })
    },
  })
}
