import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'

const postsKey = (eventId: string) => ['events', eventId, 'posts']

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

export function useDeletePost(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => eventsService.deletePost(eventId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKey(eventId) })
    },
  })
}
