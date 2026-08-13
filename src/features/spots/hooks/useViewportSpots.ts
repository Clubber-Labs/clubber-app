import { useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { Bbox } from '@/features/map/services/mapService'
import { toMapFilterParams, type MapFilters } from '@/features/map/types'
import { spotsService } from '../services/spotsService'
import { spotKeys } from './cacheKeys'

// Spots ativos da área visível — mesmo padrão do useViewportEvents: bbox já
// debounced no caller, keepPreviousData evita flicker ao arrastar o mapa.
export function useViewportSpots(
  bbox: Bbox | null,
  filters: MapFilters,
  enabled = true,
) {
  const params = useMemo(() => toMapFilterParams(filters), [filters])

  return useQuery({
    queryKey: spotKeys.viewport(bbox, params),
    queryFn: () => spotsService.listByBbox({ ...bbox!, ...params }),
    enabled: enabled && !!bbox,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
