import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import type {
  CursorPaginatedResponse,
  EventComment,
  FeedEvent,
} from '@/shared/types'
import type { InfiniteData } from '@tanstack/react-query'

const commentsKey = (eventId: string) => ['events', eventId, 'comments']

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
type CommentsCache = InfiniteData<CursorPaginatedResponse<EventComment>>

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

      queryClient.setQueriesData<FeedCache>({ queryKey: ['feed'] }, old => {
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

export function useToggleCommentLike(eventId: string) {
  const queryClient = useQueryClient()
  const key = commentsKey(eventId)

  function patch(
    cache: CommentsCache | undefined,
    commentId: string,
    nextLiked: boolean,
  ): CommentsCache | undefined {
    if (!cache) return cache
    return {
      ...cache,
      pages: cache.pages.map(page => ({
        ...page,
        data: page.data.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                userLiked: nextLiked,
                reactionsCount: comment.reactionsCount + (nextLiked ? 1 : -1),
              }
            : comment,
        ),
      })),
    }
  }

  return useMutation({
    mutationFn: async ({
      commentId,
      currentlyLiked,
    }: {
      commentId: string
      currentlyLiked: boolean
    }) => {
      if (currentlyLiked) {
        await eventsService.unlikeComment(commentId)
        return false
      }
      await eventsService.likeComment(commentId)
      return true
    },
    onMutate: async ({ commentId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<CommentsCache>(key)
      queryClient.setQueryData<CommentsCache>(key, old =>
        patch(old, commentId, !currentlyLiked),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteComment(eventId: string) {
  const queryClient = useQueryClient()
  const key = commentsKey(eventId)

  return useMutation({
    mutationFn: (commentId: string) =>
      eventsService.deleteComment(eventId, commentId),
    onMutate: async commentId => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<CommentsCache>(key)
      queryClient.setQueryData<CommentsCache>(key, old =>
        removeFromInfiniteList(old, commentId),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
