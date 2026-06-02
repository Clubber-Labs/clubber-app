import { useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { mapService, type Bbox } from '../services/mapService'
import { toMapFilterParams, type MapFilters } from '../types'
import { VIEWPORT_LIMIT } from '../constants'

// Eventos completos da área visível. O bbox é debounced no caller; quando muda,
// a queryKey muda e refetcha. keepPreviousData evita flicker ao arrastar.
export function useViewportEvents(
  bbox: Bbox | null,
  filters: MapFilters,
  enabled = true,
) {
  const params = useMemo(() => toMapFilterParams(filters), [filters])

  return useQuery({
    queryKey: ['map-events', bbox, params],
    queryFn: () =>
      mapService.getViewportEvents({ ...bbox!, ...params, limit: VIEWPORT_LIMIT }),
    enabled: enabled && !!bbox,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
