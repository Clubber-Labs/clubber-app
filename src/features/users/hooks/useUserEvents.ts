import { useInfiniteQuery } from '@tanstack/react-query'
import { usersService } from '../services/usersService'
import { userKeys } from './cacheKeys'

export function useUserEvents(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: userKeys.events(userId),
    queryFn: ({ pageParam }) =>
      usersService.getUserEvents(userId, { cursor: pageParam }),
    getNextPageParam: last => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!userId,
  })
}
