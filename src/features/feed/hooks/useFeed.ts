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
  // Normaliza pra que {} e {status: undefined} compartilhem a mesma queryKey
  // (sem normalizar, geram hashes distintos → cache duplicado).
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useInfiniteQuery({
    queryKey: ['feed', normalized],
    queryFn: ({ pageParam }) =>
      feedService.getFeed({ cursor: pageParam, ...normalized }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? null,
  })
}
