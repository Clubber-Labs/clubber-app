import { useMemo } from 'react'
import Mapbox from '@rnmapbox/maps'
import { colors } from '@/shared/theme'
import { PIN_RIM_COLOR } from '../utils/markerLayout'
import type { EventCluster } from '../hooks/useEventClusters'

type Props = {
  clusters: EventCluster[]
  onPress: (cluster: EventCluster) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

// Raio do badge: base pela quantidade de eventos + bônus pela soma de
// pessoas confirmadas/interessadas no grupo — um grupo pequeno mas lotado
// pesa mais que um grupo grande vazio.
function clusterRadius(count: number, attendees: number): number {
  const byEvents =
    count <= 10
      ? 13 + ((Math.max(count, 2) - 2) / 8) * 9
      : Math.min(30, 22 + ((count - 10) / 40) * 8)
  const byPeople = Math.min(10, Math.sqrt(attendees) * 1.1)
  return Math.round(Math.min(38, byEvents + byPeople))
}

function clusterCountSize(radius: number): number {
  if (radius >= 24) return 15
  if (radius >= 18) return 13
  return 12
}

// Badge de cluster: resumo de área, não lugar exato — círculo CENTRADO na
// coordenada, sem rabinho (a gota com emoji fica exclusiva do evento único,
// renderizada como MarkerView pelo EventMarkers).
export function EventClustersLayer({ clusters, onPress, dimmed }: Props) {
  const opacity = dimmed ? 0.5 : 1

  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: clusters.map(cluster => {
        const radius = clusterRadius(cluster.count, cluster.attendees)
        return {
          type: 'Feature',
          id: cluster.id,
          geometry: { type: 'Point', coordinates: cluster.coordinate },
          properties: {
            clusterId: cluster.id,
            countLabel: cluster.countLabel,
            radius,
            countSize: clusterCountSize(radius),
          },
        }
      }),
    }),
    [clusters],
  )

  function handlePress(event: { features: GeoJSON.Feature[] }) {
    const clusterId = event.features[0]?.properties?.clusterId
    const found = clusters.find(cluster => cluster.id === clusterId)
    if (found) onPress(found)
  }

  return (
    <Mapbox.ShapeSource id="events-source" shape={shape} onPress={handlePress}>
      <Mapbox.CircleLayer
        id="clusters"
        style={{
          // Disco branco com número escuro — mesma casca dos pins, sem cor
          // de marca; o rim escuro faz o papel do contorno das gotas.
          circleColor: colors.content,
          circleStrokeColor: PIN_RIM_COLOR,
          circleStrokeWidth: 1.5,
          circleRadius: ['get', 'radius'],
          circleOpacity: opacity,
          circleStrokeOpacity: opacity,
          // Ignora a iluminação do tema (lightPreset) → cor fiel.
          circleEmissiveStrength: 1,
        }}
      />
      <Mapbox.SymbolLayer
        id="cluster-count"
        style={{
          textField: ['get', 'countLabel'],
          textSize: ['get', 'countSize'],
          textColor: colors.background,
          // Halo fino + número sempre opaco: legível mesmo com o badge
          // esmaecido sobre o pico claro do heatmap.
          textHaloColor: colors.content,
          textHaloWidth: 1.2,
          textHaloBlur: 0.3,
          textOpacity: 1,
          textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          textIgnorePlacement: true,
          textAllowOverlap: true,
          textEmissiveStrength: 1,
        }}
      />
    </Mapbox.ShapeSource>
  )
}
