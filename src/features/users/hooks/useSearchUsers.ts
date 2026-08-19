import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { usersService } from '../services/usersService'
import { userKeys } from './cacheKeys'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import type { SearchUserItem } from '../schemas/searchUserSchema'

export function useSearchUsers(query: string) {
  const debounced = useDebounce(query, 300)
  const trimmed = debounced.trim()
  const showBanner = useBanner()

  const result = useInfiniteQuery({
    queryKey: userKeys.search(trimmed),
    queryFn: ({ pageParam, signal }) =>
      usersService.searchUsers({ q: trimmed, cursor: pageParam, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
    enabled: trimmed.length >= 2,
  })

  useEffect(() => {
    if (result.error) showBanner(getApiError(result.error).message)
  }, [result.error, showBanner])

  const users: SearchUserItem[] = useMemo(
    () => result.data?.pages.flatMap(page => page.data) ?? [],
    [result.data],
  )

  return {
    users,
    // `debouncedQuery` é o termo que efetivamente foi pra rede — usar pra
    // showIdle/showNoResults evita falso "Nenhum encontrado" durante os
    // 300ms entre keystroke e o debounce disparar.
    debouncedQuery: trimmed,
    isLoading: result.isLoading,
    isError: result.isError,
    hasNextPage: result.hasNextPage,
    fetchNextPage: result.fetchNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    refetch: result.refetch,
  }
}
