import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { followsService } from '../services/followsService'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import type {
  CursorPaginatedResponse,
  FeedAuthor,
  UserProfile,
} from '@/shared/types'

const requestsKey = ['users', 'me', 'follow-requests'] as const
type RequestsCache = InfiniteData<CursorPaginatedResponse<FeedAuthor>>

export function useFollowRequests(enabled = true) {
  return useInfiniteQuery({
    queryKey: requestsKey,
    queryFn: ({ pageParam }) =>
      followsService.listFollowRequests({ cursor: pageParam }),
    getNextPageParam: last => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled,
  })
}

function useRemoveFromList() {
  const queryClient = useQueryClient()

  function remove(followerId: string) {
    queryClient.setQueryData<RequestsCache>(requestsKey, old =>
      removeFromInfiniteList(old, followerId),
    )
  }

  function restore(snapshot: RequestsCache | undefined) {
    if (snapshot) queryClient.setQueryData(requestsKey, snapshot)
  }

  function snapshot() {
    return queryClient.getQueryData<RequestsCache>(requestsKey)
  }

  return { remove, restore, snapshot, queryClient }
}

export function useAcceptFollowRequest() {
  const { remove, restore, snapshot, queryClient } = useRemoveFromList()

  return useMutation({
    mutationFn: (followerId: string) =>
      followsService.acceptFollowRequest(followerId),
    onMutate: async followerId => {
      await queryClient.cancelQueries({ queryKey: requestsKey })
      const prev = snapshot()
      remove(followerId)
      queryClient.setQueryData<UserProfile>(userKeys.me, profile =>
        profile
          ? { ...profile, followersCount: profile.followersCount + 1 }
          : profile,
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => restore(ctx?.prev),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: requestsKey })
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}

export function useRejectFollowRequest() {
  const { remove, restore, snapshot, queryClient } = useRemoveFromList()

  return useMutation({
    mutationFn: (followerId: string) =>
      followsService.rejectFollowRequest(followerId),
    onMutate: async followerId => {
      await queryClient.cancelQueries({ queryKey: requestsKey })
      const prev = snapshot()
      remove(followerId)
      return { prev }
    },
    onError: (_err, _vars, ctx) => restore(ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: requestsKey }),
  })
}
