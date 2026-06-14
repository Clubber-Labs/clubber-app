import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
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

// Sobe imagens de um post recém-criado, uma requisição por imagem (espelha
// useUploadEventImages). Tolera falha parcial via allSettled; ao terminar,
// invalida a lista pra hidratar as imagens. O post já existe (texto-first),
// então a falha aqui não perde o conteúdo.
export function useUploadPostImages(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      postId,
      uris,
    }: {
      postId: string
      uris: string[]
    }) => {
      const results = await Promise.allSettled(
        uris.map(uri => eventsService.uploadPostImage(eventId, postId, uri)),
      )
      const failed = results.filter(r => r.status === 'rejected').length
      return { postId, total: uris.length, failed }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKey(eventId) })
    },
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
