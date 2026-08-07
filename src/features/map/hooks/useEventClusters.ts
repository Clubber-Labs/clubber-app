import { useMemo } from 'react'
import Supercluster from 'supercluster'
import type { FeedEvent } from '@/shared/types'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '../constants'

export type EventCluster = {
  id: number
  count: number
  countLabel: string
  coordinate: [number, number]
  expansionZoom: number
}

type PointProps = { eventId: string }

// Clusterização em JS (mesma lib do Mapbox GL) em vez do cluster nativo do
// ShapeSource: assim sabemos QUAIS eventos ficaram de fora dos grupos e
// podemos renderizá-los como MarkerView completo (emoji + confirmados) em
// qualquer zoom — pilha de avatares com foto remota não existe em style
// layer. Grupos continuam como badges nativos.
export function useEventClusters(events: FeedEvent[], zoom: number) {
  const { index, byId } = useMemo(() => {
    const byId = new Map(events.map(event => [event.id, event]))
    const index = new Supercluster<PointProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM - 1,
    })
    index.load(
      events.map(event => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [event.longitude, event.latitude],
        },
        properties: { eventId: event.id },
      })),
    )
    return { index, byId }
  }, [events])

  return useMemo(() => {
    const features = index.getClusters([-180, -85, 180, 85], Math.floor(zoom))
    const clusters: EventCluster[] = []
    const singles: FeedEvent[] = []
    for (const feature of features) {
      const props = feature.properties
      if ('cluster' in props && props.cluster) {
        const id = feature.id as number
        clusters.push({
          id,
          count: props.point_count,
          countLabel: String(props.point_count_abbreviated),
          coordinate: feature.geometry.coordinates as [number, number],
          expansionZoom: index.getClusterExpansionZoom(id),
        })
      } else {
        const event = byId.get(props.eventId)
        if (event) singles.push(event)
      }
    }
    return { clusters, singles }
  }, [index, byId, zoom])
}
