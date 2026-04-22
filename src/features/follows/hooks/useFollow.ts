import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { followsService } from '../services/followsService'

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: () => followsService.followers(userId),
    enabled: !!userId,
  })
}

export function useFollow(userId: string) {
  const queryClient = useQueryClient()

  const follow = useMutation({
    mutationFn: () => followsService.follow(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['followers', userId] }),
  })

  const unfollow = useMutation({
    mutationFn: () => followsService.unfollow(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['followers', userId] }),
  })

  return { follow, unfollow }
}
