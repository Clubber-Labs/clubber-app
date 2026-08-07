import { useMemo } from 'react'
import Mapbox from '@rnmapbox/maps'
import { colors } from '@/shared/theme'
import type { EventCluster } from '../hooks/useEventClusters'

type Props = {
  clusters: EventCluster[]
  onPress: (cluster: EventCluster) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

// Badge de cluster: resumo de área, não lugar exato — círculo CENTRADO na
// coordenada, sem rabinho (a gota com emoji fica exclusiva do evento único,
// renderizada como MarkerView pelo EventMarkers). O raio cresce contínuo
// com a contagem, dando hierarquia visual.
export function EventClustersLayer({ clusters, onPress, dimmed }: Props) {
  const opacity = dimmed ? 0.5 : 1

  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: clusters.map(cluster => ({
        type: 'Feature',
        id: cluster.id,
        geometry: { type: 'Point', coordinates: cluster.coordinate },
        properties: {
          clusterId: cluster.id,
          count: cluster.count,
          countLabel: cluster.countLabel,
          expansionZoom: cluster.expansionZoom,
        },
      })),
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
          circleColor: colors.brand,
          circleStrokeColor: colors.content,
          circleStrokeWidth: 1.5,
          circleRadius: [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            2,
            13,
            10,
            24,
            50,
            34,
          ],
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
          textSize: ['step', ['get', 'count'], 12, 5, 13, 10, 15],
          textColor: colors.content,
          // Halo fino + número sempre opaco: legível mesmo com o badge
          // esmaecido sobre o pico claro do heatmap.
          textHaloColor: colors.background,
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
