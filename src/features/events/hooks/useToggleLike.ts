import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type {
  CursorPaginatedResponse,
  EventDetail,
  FeedEvent,
  ReactionType,
} from '@/shared/types'
import type { InfiniteData } from '@tanstack/react-query'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>

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

      const prevFeed = queryClient.getQueryData<FeedCache>(feedKey)
      const prevDetail = queryClient.getQueryData<EventDetail>(detailKey)

      const willLike = currentReaction !== 'LIKE'
      const reactionDelta = willLike ? 1 : -1
      const nextReaction: ReactionType | null = willLike ? 'LIKE' : null

      queryClient.setQueryData<FeedCache>(feedKey, old =>
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

      return { prevFeed, prevDetail }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevFeed) queryClient.setQueryData(feedKey, context.prevFeed)
      if (context?.prevDetail)
        queryClient.setQueryData(detailKey, context.prevDetail)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKey })
      queryClient.invalidateQueries({ queryKey: detailKey })
    },
  })
}
