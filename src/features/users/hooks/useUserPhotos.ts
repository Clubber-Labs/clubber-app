import { useInfiniteQuery } from '@tanstack/react-query'
import { usersService } from '../services/usersService'
import { userKeys } from './cacheKeys'

export function useUserPhotos(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: userKeys.photos(userId),
    queryFn: ({ pageParam }) =>
      usersService.getUserPhotos(userId, { cursor: pageParam }),
    getNextPageParam: last => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!userId,
  })
}
