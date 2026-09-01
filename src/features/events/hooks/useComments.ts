import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { eventsService, type CommentTarget } from '../services/eventsService'
import { commentKeys } from './cacheKeys'
import { useMe } from '@/features/auth/hooks/useMe'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import type {
  CursorPaginatedResponse,
  EventComment,
  FeedEvent,
} from '@/shared/types'
import type { InfiniteData } from '@tanstack/react-query'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
type CommentsCache = InfiniteData<CursorPaginatedResponse<EventComment>>

// Raiz e resposta moram em caches diferentes: a lista do alvo e a lista de
// respostas daquele pai. `parentId` é o que escolhe qual.
const listKeyFor = (target: CommentTarget, parentId?: string) =>
  parentId ? commentKeys.replies(target, parentId) : commentKeys.list(target)

export function useCommentList(target: CommentTarget) {
  const key = commentKeys.list(target)
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) =>
      eventsService.listComments(target, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
  })
}

// Um comentário avulso. Só existe porque o deep-link da notificação chega sem
// ter passado pela lista — não há cache de onde tirá-lo.
export function useComment(target: CommentTarget, commentId?: string) {
  return useQuery({
    queryKey: commentKeys.detail(target, commentId ?? ''),
    queryFn: () => eventsService.getComment(target, commentId as string),
    enabled: !!commentId,
  })
}

export function useReplies(target: CommentTarget, parentId: string) {
  return useInfiniteQuery({
    queryKey: commentKeys.replies(target, parentId),
    queryFn: ({ pageParam }) =>
      eventsService.listReplies(target, parentId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
  })
}

// Patch de um evento no cache do feed — mantém prévia e contador em dia sem
// esperar a rede. Só faz sentido pro alvo evento: o card do feed é dele.
function patchFeedEvent(
  queryClient: ReturnType<typeof useQueryClient>,
  target: CommentTarget,
  apply: (event: FeedEvent) => FeedEvent,
) {
  if (target.kind !== 'event') return
  queryClient.setQueriesData<FeedCache>({ queryKey: ['feed'] }, old =>
    !old
      ? old
      : {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(event =>
              event.id === target.eventId ? apply(event) : event,
            ),
          })),
        },
  )
}

function invalidateAround(
  queryClient: ReturnType<typeof useQueryClient>,
  target: CommentTarget,
  parentId?: string,
) {
  queryClient.invalidateQueries({ queryKey: listKeyFor(target, parentId) })
  // O contador de respostas mora no pai, que a lista de raízes também serve.
  if (parentId) {
    queryClient.invalidateQueries({
      queryKey: commentKeys.detail(target, parentId),
    })
    queryClient.invalidateQueries({ queryKey: commentKeys.list(target) })
  }
  if (target.kind === 'event') {
    queryClient.invalidateQueries({ queryKey: ['events', target.eventId] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }
}

/**
 * Comentar com resposta imediata: entra na lista, na prévia do feed e no
 * contador antes da rede responder, marcado `pending` pra a UI esmaecê-lo.
 * Falhou, tudo volta — quem chama devolve o texto ao campo.
 *
 * Raiz entra no TOPO e resposta no FIM: a lista de raízes é exibida do mais
 * novo pro mais velho, a de respostas é cronológica.
 *
 * Sem o perfil em mãos (cache de /users/me frio) não há autor pra montar o
 * item; aí o envio segue sem otimismo, e a lista só atualiza no invalidate.
 */
export function useAddComment(target: CommentTarget) {
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string
      parentId?: string
    }) =>
      parentId
        ? eventsService.addReply(target, parentId, content)
        : eventsService.addComment(target, content),
    onMutate: async ({ content, parentId }) => {
      const key = listKeyFor(target, parentId)
      if (!me) return { key, prev: undefined, prevFeeds: undefined }
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
        repliesCount: 0,
        parentId: parentId ?? null,
        userLiked: false,
        pending: true,
      }

      queryClient.setQueryData<CommentsCache>(key, old => {
        if (!old) return old
        const last = old.pages.length - 1
        return {
          ...old,
          pages: old.pages.map((page, i) => {
            if (parentId) {
              return i === last
                ? { ...page, data: [...page.data, optimistic] }
                : page
            }
            return i === 0
              ? { ...page, data: [optimistic, ...page.data] }
              : page
          }),
        }
      })
      patchFeedEvent(queryClient, target, event => ({
        ...event,
        recentComments: [optimistic, ...event.recentComments].slice(0, 2),
        _count: { ...event._count, comments: event._count.comments + 1 },
      }))

      return { key, prev, prevFeeds }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev)
      ctx?.prevFeeds?.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      )
    },
    onSettled: (_data, _err, { parentId }) =>
      invalidateAround(queryClient, target, parentId),
  })
}

const applyLike = (
  comment: EventComment,
  nextLiked: boolean,
): EventComment => ({
  ...comment,
  userLiked: nextLiked,
  reactionsCount: comment.reactionsCount + (nextLiked ? 1 : -1),
})

export function useToggleCommentLike(target: CommentTarget) {
  const queryClient = useQueryClient()

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
          comment.id === commentId ? applyLike(comment, nextLiked) : comment,
        ),
      })),
    }
  }

  return useMutation({
    mutationFn: ({
      commentId,
      currentlyLiked,
    }: {
      commentId: string
      currentlyLiked: boolean
      parentId?: string
    }) =>
      currentlyLiked
        ? eventsService.unlikeComment(commentId)
        : eventsService.likeComment(commentId),
    onMutate: async ({ commentId, currentlyLiked, parentId }) => {
      const key = listKeyFor(target, parentId)
      const detailKey = commentKeys.detail(target, commentId)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: key }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ])
      const prev = queryClient.getQueryData<CommentsCache>(key)
      const prevDetail = queryClient.getQueryData<EventComment>(detailKey)
      queryClient.setQueryData<CommentsCache>(key, old =>
        patch(old, commentId, !currentlyLiked),
      )
      // A raiz fixada pelo deep-link é servida pelo cache de detalhe, não pelo
      // da lista — sem o mesmo patch aqui, curtir ela seria um toque morto.
      queryClient.setQueryData<EventComment>(detailKey, old =>
        old ? applyLike(old, !currentlyLiked) : old,
      )
      return { key, prev, detailKey, prevDetail }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev)
      if (ctx?.prevDetail) {
        queryClient.setQueryData(ctx.detailKey, ctx.prevDetail)
      }
    },
    onSettled: (_data, _err, { commentId, parentId }) => {
      queryClient.invalidateQueries({ queryKey: listKeyFor(target, parentId) })
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(target, commentId),
      })
    },
  })
}

// Optimistic remove — ver CLAUDE.md → "Tratamento de erros e feedback".
export function useDeleteComment(target: CommentTarget) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; parentId?: string }) =>
      eventsService.deleteComment(target, commentId),
    onMutate: async ({ commentId, parentId }) => {
      const key = listKeyFor(target, parentId)
      const detailKey = commentKeys.detail(target, commentId)
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<CommentsCache>(key)
      const prevDetail = queryClient.getQueryData<EventComment>(detailKey)
      const prevFeeds = queryClient.getQueriesData<FeedCache>({
        queryKey: ['feed'],
      })
      queryClient.setQueryData<CommentsCache>(key, old =>
        removeFromInfiniteList(old, commentId),
      )
      // A raiz fixada pelo deep-link não está na lista, então o filtro acima
      // não a alcança: sem descartar o detalhe, ela sobreviveria à remoção.
      queryClient.removeQueries({ queryKey: detailKey })
      // O contador e a prévia do feed andam junto com a lista: sem isto o card
      // seguiria anunciando um comentário que já saiu.
      patchFeedEvent(queryClient, target, event => ({
        ...event,
        recentComments: event.recentComments.filter(c => c.id !== commentId),
        _count: {
          ...event._count,
          comments: Math.max(0, event._count.comments - 1),
        },
      }))
      return { key, prev, detailKey, prevDetail, prevFeeds }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev)
      if (ctx?.prevDetail) {
        queryClient.setQueryData(ctx.detailKey, ctx.prevDetail)
      }
      ctx?.prevFeeds?.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      )
    },
    onSettled: (_data, _err, { parentId }) =>
      invalidateAround(queryClient, target, parentId),
  })
}
