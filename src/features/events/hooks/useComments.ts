import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type { CursorPaginatedResponse, FeedEvent } from '@/shared/types'
import type { InfiniteData } from '@tanstack/react-query'

const commentsKey = (eventId: string) => ['events', eventId, 'comments']

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>

export function useComments(eventId: string) {
  return useInfiniteQuery({
    queryKey: commentsKey(eventId),
    queryFn: ({ pageParam }) =>
      eventsService.listComments(eventId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
    enabled: !!eventId,
  })
}

export function useAddComment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => eventsService.addComment(eventId, content),
    onSuccess: created => {
      queryClient.invalidateQueries({ queryKey: commentsKey(eventId) })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })

      queryClient.setQueryData<FeedCache>(['feed'], old => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(event =>
              event.id === eventId
                ? {
                    ...event,
                    recentComments: [created, ...event.recentComments].slice(
                      0,
                      2,
                    ),
                    _count: {
                      ...event._count,
                      comments: event._count.comments + 1,
                    },
                  }
                : event,
            ),
          })),
        }
      })
    },
  })
}

export function useDeleteComment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) =>
      eventsService.deleteComment(eventId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(eventId) })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
