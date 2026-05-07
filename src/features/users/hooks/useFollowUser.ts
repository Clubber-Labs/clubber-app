import { useMutation, useQueryClient } from '@tanstack/react-query'
import { followsService } from '@/features/follows/services/followsService'
import type { UserProfile, FollowStatus } from '@/shared/types'
import { userKeys } from './cacheKeys'

type Snapshot = { profile: UserProfile | undefined }

export function useFollowUser(userId: string) {
  const queryClient = useQueryClient()
  const queryKey = userKeys.profile(userId)

  function applyStatus(status: FollowStatus, deltaFollowers: number) {
    queryClient.setQueryData<UserProfile>(queryKey, prev => {
      if (!prev) return prev
      return {
        ...prev,
        followStatus: status,
        followersCount: Math.max(0, prev.followersCount + deltaFollowers),
      }
    })
  }

  function snapshot(): Snapshot {
    return { profile: queryClient.getQueryData<UserProfile>(queryKey) }
  }

  function restore({ profile }: Snapshot) {
    queryClient.setQueryData(queryKey, profile)
  }

  const follow = useMutation({
    mutationFn: () => followsService.follow(userId),
    onMutate: () => {
      const prev = snapshot()
      const isPrivate = prev.profile?.isPrivate ?? false
      applyStatus(isPrivate ? 'PENDING' : 'ACCEPTED', isPrivate ? 0 : 1)
      return prev
    },
    onError: (_err, _vars, ctx) => ctx && restore(ctx),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  const unfollow = useMutation({
    mutationFn: () => followsService.unfollow(userId),
    onMutate: () => {
      const prev = snapshot()
      const wasAccepted = prev.profile?.followStatus === 'ACCEPTED'
      applyStatus(null, wasAccepted ? -1 : 0)
      return prev
    },
    onError: (_err, _vars, ctx) => ctx && restore(ctx),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { follow, unfollow }
}
