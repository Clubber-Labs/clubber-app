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

type FollowingCache = InfiniteData<CursorPaginatedResponse<FeedAuthor>>

type Snapshot = {
  prevList: FollowingCache | undefined
  prevMyProfile: UserProfile | undefined
  prevTargetProfile: UserProfile | undefined
}

// Optimistic remove + revert — ver CLAUDE.md → "Tratamento de erros e feedback".
export function useUnfollowFromList(viewerId: string) {
  const queryClient = useQueryClient()
  const listKey = followListKeys.following(viewerId)

  return useMutation({
    mutationFn: (targetId: string) => followsService.unfollow(targetId),
    onMutate: async targetId => {
      const targetProfileKey = userKeys.profile(targetId)

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: userKeys.me })
      await queryClient.cancelQueries({ queryKey: targetProfileKey })

      const snapshot: Snapshot = {
        prevList: queryClient.getQueryData<FollowingCache>(listKey),
        prevMyProfile: queryClient.getQueryData<UserProfile>(userKeys.me),
        prevTargetProfile:
          queryClient.getQueryData<UserProfile>(targetProfileKey),
      }

      queryClient.setQueryData<FollowingCache>(listKey, old =>
        removeFromInfiniteList(old, targetId),
      )
      queryClient.setQueryData<UserProfile>(userKeys.me, prev =>
        prev
          ? { ...prev, followingCount: Math.max(0, prev.followingCount - 1) }
          : prev,
      )
      queryClient.setQueryData<UserProfile>(targetProfileKey, prev =>
        prev
          ? {
              ...prev,
              followStatus: null,
              followersCount: Math.max(0, prev.followersCount - 1),
            }
          : prev,
      )

      return { snapshot, targetId }
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      const { snapshot, targetId } = ctx
      if (snapshot.prevList)
        queryClient.setQueryData(listKey, snapshot.prevList)
      if (snapshot.prevMyProfile)
        queryClient.setQueryData(userKeys.me, snapshot.prevMyProfile)
      if (snapshot.prevTargetProfile)
        queryClient.setQueryData(
          userKeys.profile(targetId),
          snapshot.prevTargetProfile,
        )
    },
    onSettled: (_data, _err, targetId) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: userKeys.me })
      queryClient.invalidateQueries({ queryKey: userKeys.profile(targetId) })
    },
  })
}
