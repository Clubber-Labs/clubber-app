import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type {
  CursorPaginatedResponse,
  EventDetail,
  FeedEvent,
} from '@/shared/types'
import type { InfiniteData, QueryKey } from '@tanstack/react-query'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
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
    mutationFn: async (currentlyLiked: boolean) => {
      if (currentlyLiked) {
        await eventsService.unlikeEvent(eventId)
        return false
      }
      await eventsService.likeEvent(eventId)
      return true
    },
    onMutate: async currentlyLiked => {
      await queryClient.cancelQueries({ queryKey: feedKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const prevFeeds: FeedSnapshot = queryClient.getQueriesData<FeedCache>({
        queryKey: feedKey,
      })
      const prevDetail = queryClient.getQueryData<EventDetail>(detailKey)

      const nextLiked = !currentlyLiked
      const reactionDelta = nextLiked ? 1 : -1

      queryClient.setQueriesData<FeedCache>({ queryKey: feedKey }, old =>
        patchFeedEvent(old, eventId, event => ({
          ...event,
          userLiked: nextLiked,
          _count: {
            ...event._count,
            reactions: event._count.reactions + reactionDelta,
          },
        })),
      )
      queryClient.setQueryData<EventDetail>(detailKey, old =>
        patchDetail(old, event => ({
          ...event,
          userLiked: nextLiked,
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
