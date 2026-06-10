import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import { notificationsService } from '../services/notificationsService'
import { notificationKeys } from './cacheKeys'

export function useNotifications() {
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list,
    queryFn: ({ pageParam }) =>
      notificationsService.list({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
  })

  const notifications = useMemo(
    () => flattenInfiniteList(query.data),
    [query.data],
  )

  return { ...query, notifications }
}
