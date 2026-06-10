import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { followsService } from '../services/followsService'
import { followListKeys } from './useFollowList'
import { userKeys } from '@/features/users/hooks/cacheKeys'
import { removeFromInfiniteList } from '@/shared/utils/infiniteList'
import type {
  CursorPaginatedResponse,
  FeedAuthor,
  UserProfile,
} from '@/shared/types'

type FollowersCache = InfiniteData<CursorPaginatedResponse<FeedAuthor>>

// Optimistic remove + revert — ver CLAUDE.md → "Tratamento de erros e feedback".
export function useRemoveFollower(viewerId: string) {
  const queryClient = useQueryClient()
  const listKey = followListKeys.followers(viewerId)

  return useMutation({
    mutationFn: (followerId: string) =>
      followsService.removeFollower(followerId),
    onMutate: async followerId => {
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: userKeys.me })

      const prevList = queryClient.getQueryData<FollowersCache>(listKey)
      const prevProfile = queryClient.getQueryData<UserProfile>(userKeys.me)

      queryClient.setQueryData<FollowersCache>(listKey, old =>
        removeFromInfiniteList(old, followerId),
      )
      queryClient.setQueryData<UserProfile>(userKeys.me, prev =>
        prev
          ? {
              ...prev,
              followersCount: Math.max(0, prev.followersCount - 1),
            }
          : prev,
      )

      return { prevList, prevProfile }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevList) queryClient.setQueryData(listKey, ctx.prevList)
      if (ctx?.prevProfile)
        queryClient.setQueryData(userKeys.me, ctx.prevProfile)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
