import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { usePostLikesStore } from '../store/postLikesStore'
import { getApiError } from '@/shared/lib/apiError'
import { useBanner } from '@/shared/lib/banner'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import { settleAll } from '@/shared/utils/settleAll'
import type { CursorPaginatedResponse, EventPost } from '@/shared/types'

const postsKey = (eventId: string) => ['events', eventId, 'posts']

type PostsCache = InfiniteData<CursorPaginatedResponse<EventPost>>

export function usePosts(eventId: string) {
  return useInfiniteQuery({
    queryKey: postsKey(eventId),
    queryFn: ({ pageParam }) =>
      eventsService.listPosts(eventId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
    enabled: !!eventId,
  })
}

export function useAddPost(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => eventsService.addPost(eventId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKey(eventId) })
    },
  })
}

/**
 * Sobe imagens de um post recém-criado, uma requisição por imagem (espelha
 * useUploadEventImages). O post já existe (texto-first), então a falha aqui não
 * perde o conteúdo — mas ela PRECISA aparecer: o post publica sem a foto, e sem
 * uma linha dizendo o motivo (arquivo grande demais, formato ilegível, rede) o
 * app parece ter engolido a imagem.
 */
export function useUploadPostImages(eventId: string) {
  const queryClient = useQueryClient()
  const showBanner = useBanner()

  return useMutation({
    mutationFn: ({ postId, uris }: { postId: string; uris: string[] }) =>
      settleAll(
        uris.map(uri => eventsService.uploadPostImage(eventId, postId, uri)),
      ),
    onError: error => showBanner(getApiError(error).message),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKey(eventId) })
    },
  })
}

/**
 * Curtir post, padrão otimista canônico + a memória do postLikesStore.
 *
 * O store não é enfeite: como o GET não devolve `userLiked`, o invalidate do
 * `onSettled` apagaria o estado da curtida e o toque seguinte chamaria `like`
 * outra vez em vez de `unlike` — coração vazio e contagem subindo em dobro. A
 * contagem continua vindo do servidor; o store guarda só o "fui eu".
 */
export function useTogglePostLike(eventId: string) {
  const queryClient = useQueryClient()
  const key = postsKey(eventId)
  const setLiked = usePostLikesStore(s => s.setLiked)

  return useMutation({
    mutationFn: ({
      postId,
      currentlyLiked,
    }: {
      postId: string
      currentlyLiked: boolean
    }) =>
      currentlyLiked
        ? eventsService.unlikePost(postId)
        : eventsService.likePost(postId),
    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<PostsCache>(key)
      setLiked(postId, !currentlyLiked)
      queryClient.setQueryData<PostsCache>(key, old =>
        !old
          ? old
          : {
              ...old,
              pages: old.pages.map(page => ({
                ...page,
                data: page.data.map(post =>
                  post.id === postId
                    ? {
                        ...post,
                        userLiked: !currentlyLiked,
                        _count: post._count && {
                          ...post._count,
                          reactions:
                            post._count.reactions + (currentlyLiked ? -1 : 1),
                        },
                      }
                    : post,
                ),
              })),
            },
      )
      return { prev }
    },
    onError: (_err, { postId, currentlyLiked }, ctx) => {
      setLiked(postId, currentlyLiked)
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

// Optimistic remove — ver CLAUDE.md → "Tratamento de erros e feedback".
export function useDeletePost(eventId: string) {
  const queryClient = useQueryClient()
  const key = postsKey(eventId)

  return useMutation({
    mutationFn: (postId: string) => eventsService.deletePost(eventId, postId),
    onMutate: async postId => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<PostsCache>(key)
      queryClient.setQueryData<PostsCache>(key, old =>
        removeFromInfiniteList(old, postId),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
