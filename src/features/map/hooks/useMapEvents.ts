import { useMemo } from 'react'
import { useViewportEvents } from './useViewportEvents'
import type { Bbox } from '../services/mapService'
import type { MapFilters } from '../types'
import type { FeedEvent } from '@/shared/types'

// Eventos do mapa por viewport (sem o antigo teto de 50). Categoria/status/
// amigos filtram no backend; a clusterização fica no useEventClusters.
export function useMapEvents(
  bbox: Bbox | null,
  filters: MapFilters,
  enabled = true,
) {
  const { data, isLoading, error } = useViewportEvents(bbox, filters, enabled)

  const events = useMemo<FeedEvent[]>(
    () =>
      (data?.data ?? []).filter(
        e => typeof e.latitude === 'number' && typeof e.longitude === 'number',
      ),
    [data],
  )

  return {
    events,
    truncated: data?.truncated ?? false,
    isLoading,
    error,
  }
}
