import { useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { Bbox } from '@/features/map/services/mapService'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'
import type { SpotListFilters } from '../types'

// Spots ativos da área visível — mesmo padrão do useViewportEvents: bbox já
// debounced no caller, keepPreviousData evita flicker ao arrastar o mapa.
export function useViewportSpots(
  bbox: Bbox | null,
  filters: { categories: string[]; friendsOnly: boolean },
  enabled = true,
) {
  const params = useMemo<SpotListFilters>(
    () => ({
      category: filters.categories.length ? filters.categories : undefined,
      friendsOnly: filters.friendsOnly || undefined,
    }),
    [filters.categories, filters.friendsOnly],
  )

  return useQuery({
    queryKey: spotKeys.viewport(bbox, params),
    queryFn: () => spotsService.listByBbox({ ...bbox!, ...params }),
    enabled: enabled && !!bbox,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
