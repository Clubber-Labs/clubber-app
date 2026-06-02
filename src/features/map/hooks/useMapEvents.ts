import { useMemo } from 'react'
import { useViewportEvents } from './useViewportEvents'
import type { Bbox } from '../services/mapService'
import type { MapFilters } from '../types'
import type { FeedEvent } from '@/shared/types'

// Eventos do mapa por viewport (sem o antigo teto de 50). Categoria/status/amigos
// filtram no backend; aqui só derivamos o GeoJSON pros clusters do Mapbox.
export function useMapEvents(bbox: Bbox | null, filters: MapFilters) {
  const { data, isLoading, error } = useViewportEvents(bbox, filters)

  const events = useMemo<FeedEvent[]>(
    () =>
      (data?.data ?? []).filter(
        e => typeof e.latitude === 'number' && typeof e.longitude === 'number',
      ),
    [data],
  )

  const eventsGeoJson = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: events.map(event => ({
        type: 'Feature',
        id: event.id,
        properties: { eventId: event.id, title: event.title },
        geometry: {
          type: 'Point',
          coordinates: [event.longitude, event.latitude],
        },
      })),
    }),
    [events],
  )

  return {
    events,
    eventsGeoJson,
    truncated: data?.truncated ?? false,
    isLoading,
    error,
  }
}
