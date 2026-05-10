import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { feedService } from '../services/feedService'
import { normalizeFilters } from '@/shared/utils/normalizeFilters'
import type { EventStatus } from '@/shared/types'

type Filters = {
  status?: EventStatus[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  includePast?: boolean
}

export function useFeed(filters: Filters = {}) {
  // Memoiza pra estabilizar referência entre renders quando o filtro lógico
  // não muda — evita refetch só por o parent reconstruir o objeto.
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useInfiniteQuery({
    queryKey: ['feed', normalized],
    queryFn: ({ pageParam }) =>
      feedService.getFeed({ cursor: pageParam, ...normalized }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
  })
}
