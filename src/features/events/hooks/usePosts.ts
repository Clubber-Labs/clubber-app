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
