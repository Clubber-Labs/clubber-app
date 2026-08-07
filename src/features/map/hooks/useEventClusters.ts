import { useMemo } from 'react'
import Supercluster from 'supercluster'
import type { FeedEvent } from '@/shared/types'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '../constants'

export type EventCluster = {
  id: number
  count: number
  countLabel: string
  // Soma das presenças dos eventos do grupo — pesa no raio do badge.
  attendees: number
  coordinate: [number, number]
  expansionZoom: number
}

type PointProps = { eventId: string; attendees: number }
type ClusterProps = { attendees: number }

// Clusterização em JS (mesma lib do Mapbox GL) em vez do cluster nativo do
// ShapeSource: assim sabemos QUAIS eventos ficaram de fora dos grupos e
// podemos renderizá-los como MarkerView completo (emoji + confirmados) em
// qualquer zoom — pilha de avatares com foto remota não existe em style
// layer. Grupos continuam como badges nativos.
export function useEventClusters(events: FeedEvent[], zoom: number) {
  const { index, byId } = useMemo(() => {
    const byId = new Map(events.map(event => [event.id, event]))
    const index = new Supercluster<PointProps, ClusterProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM - 1,
      map: props => ({ attendees: props.attendees }),
      reduce: (accumulated, props) => {
        accumulated.attendees += props.attendees
      },
    })
    index.load(
      events.map(event => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [event.longitude, event.latitude],
        },
        properties: {
          eventId: event.id,
          attendees: event._count.attendances,
        },
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
      if ('cluster' in props) {
        const id = feature.id as number
        clusters.push({
          id,
          count: props.point_count,
          countLabel: String(props.point_count_abbreviated),
          attendees: props.attendees,
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
