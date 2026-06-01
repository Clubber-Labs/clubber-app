import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { usersSearchService } from '../services/usersSearchService'
import type { UserMini } from '@/shared/types'

export function useChatUserSearch(query: string) {
  const debounced = useDebounce(query, 300)
  const trimmed = debounced.trim()

  const result = useInfiniteQuery({
    queryKey: ['chat', 'user-search', trimmed],
    queryFn: ({ pageParam, signal }) =>
      usersSearchService.search({ q: trimmed, cursor: pageParam, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
    enabled: trimmed.length >= 2,
  })

  const users = useMemo<UserMini[]>(
    () => result.data?.pages.flatMap(p => p.data) ?? [],
    [result.data],
  )

  return {
    users,
    trimmed,
    isLoading: result.isLoading,
    hasNextPage: result.hasNextPage,
    fetchNextPage: result.fetchNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  }
}
