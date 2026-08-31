import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { useMe } from '@/features/auth/hooks/useMe'
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

// Patch de um evento no cache do feed — usado pra manter prévia e contador em
// dia sem esperar a rede. `delta` move _count.comments.
function patchFeedEvent(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  apply: (event: FeedEvent) => FeedEvent,
) {
  queryClient.setQueriesData<FeedCache>({ queryKey: ['feed'] }, old =>
    !old
      ? old
      : {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(event =>
              event.id === eventId ? apply(event) : event,
            ),
          })),
        },
  )
}

/**
 * Comentar com resposta imediata: o comentário entra na lista, na prévia do
 * feed e no contador antes da rede responder, marcado `pending` pra a UI
 * esmaecê-lo. Falhou, tudo volta — quem chama devolve o texto ao campo.
 *
 * Sem o perfil em mãos (cache de /users/me frio) não há autor pra montar o
 * item; aí o envio segue sem otimismo, e a lista só atualiza no invalidate.
 */
export function useAddComment(eventId: string) {
  const queryClient = useQueryClient()
  const key = commentsKey(eventId)
  const { data: me } = useMe()

  return useMutation({
    mutationFn: (content: string) => eventsService.addComment(eventId, content),
    onMutate: async content => {
      if (!me) return { prev: undefined, prevFeeds: undefined }
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<CommentsCache>(key)
      const prevFeeds = queryClient.getQueriesData<FeedCache>({
        queryKey: ['feed'],
      })

      const optimistic: EventComment = {
        id: `pending-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        authorId: me.id,
        author: {
          id: me.id,
          name: me.name,
          lastname: me.lastname,
          username: me.username,
          avatarUrl: me.avatarUrl,
        },
        reactionsCount: 0,
        userLiked: false,
        pending: true,
      }

      queryClient.setQueryData<CommentsCache>(key, old =>
        !old
          ? old
          : {
              ...old,
              pages: old.pages.map((page, i) =>
                i === 0 ? { ...page, data: [optimistic, ...page.data] } : page,
              ),
            },
      )
      patchFeedEvent(queryClient, eventId, event => ({
        ...event,
        recentComments: [optimistic, ...event.recentComments].slice(0, 2),
        _count: { ...event._count, comments: event._count.comments + 1 },
      }))

      return { prev, prevFeeds }
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
      ctx?.prevFeeds?.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
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
      const prevFeeds = queryClient.getQueriesData<FeedCache>({
        queryKey: ['feed'],
      })
      queryClient.setQueryData<CommentsCache>(key, old =>
        removeFromInfiniteList(old, commentId),
      )
      // O contador e a prévia do feed andam junto com a lista: sem isto o card
      // seguiria anunciando um comentário que já saiu.
      patchFeedEvent(queryClient, eventId, event => ({
        ...event,
        recentComments: event.recentComments.filter(c => c.id !== commentId),
        _count: {
          ...event._count,
          comments: Math.max(0, event._count.comments - 1),
        },
      }))
      return { prev, prevFeeds }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
      ctx?.prevFeeds?.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
