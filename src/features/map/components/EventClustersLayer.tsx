import { forwardRef } from 'react'
import Mapbox from '@rnmapbox/maps'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '../constants'
import { colors } from '@/shared/theme'
import {
  CategoryPinImages,
  CATEGORY_PIN_PREFIX,
  CATEGORY_PIN_TIP_OFFSET,
} from './CategoryPinImages'

type Props = {
  shape: GeoJSON.FeatureCollection
  onPress: (event: { features: GeoJSON.Feature[] }) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

// Cluster é resumo de área, não lugar exato: badge circular CENTRADO na
// coordenada, sem rabinho — a gota (com emoji) fica exclusiva do evento
// único. O raio cresce contínuo com a contagem, dando hierarquia visual:
// grupos pequenos discretos, grandes chamando o olho.
export const EventClustersLayer = forwardRef<Mapbox.ShapeSource, Props>(
  function EventClustersLayer({ shape, onPress, dimmed }, ref) {
    const opacity = dimmed ? 0.5 : 1
    return (
      <>
        <CategoryPinImages />
        <Mapbox.ShapeSource
          ref={ref}
          id="events-source"
          shape={shape}
          cluster
          clusterRadius={CLUSTER_RADIUS}
          clusterMaxZoomLevel={CLUSTER_MAX_ZOOM}
          onPress={onPress}
        >
          <Mapbox.CircleLayer
            id="clusters"
            filter={['has', 'point_count']}
            style={{
              circleColor: colors.brand,
              circleStrokeColor: colors.content,
              circleStrokeWidth: 1.5,
              circleRadius: [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
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
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: ['step', ['get', 'point_count'], 12, 5, 13, 10, 15],
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
          {/* Evento não-agrupado: o MESMO pin grande do zoom alto, com o
              emoji da categoria (imagens da CategoryPinImages). */}
          <Mapbox.SymbolLayer
            id="single-points"
            filter={['!', ['has', 'point_count']]}
            style={{
              iconImage: [
                'concat',
                CATEGORY_PIN_PREFIX,
                ['get', 'pinCategory'],
              ],
              iconAnchor: 'bottom',
              iconOffset: CATEGORY_PIN_TIP_OFFSET,
              iconSize: 1,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconOpacity: opacity,
              iconEmissiveStrength: 1,
            }}
          />
        </Mapbox.ShapeSource>
      </>
    )
  },
)
