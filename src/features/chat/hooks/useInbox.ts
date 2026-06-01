import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import { conversationsService } from '../services/conversationsService'
import { chatKeys } from './cacheKeys'

export function useInbox() {
  const query = useInfiniteQuery({
    queryKey: chatKeys.inbox,
    queryFn: ({ pageParam }) =>
      conversationsService.list({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
  })

  const conversations = useMemo(
    () => flattenInfiniteList(query.data),
    [query.data],
  )

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  )

  return { ...query, conversations, unreadTotal }
}
