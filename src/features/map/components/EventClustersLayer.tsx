import { forwardRef } from 'react'
import Mapbox from '@rnmapbox/maps'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS, VIOLET_600 } from '../constants'

type Props = {
  shape: GeoJSON.FeatureCollection
  onPress: (event: { features: GeoJSON.Feature[] }) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

export const EventClustersLayer = forwardRef<Mapbox.ShapeSource, Props>(
  function EventClustersLayer({ shape, onPress, dimmed }, ref) {
    const opacity = dimmed ? 0.5 : 1
    return (
      <Mapbox.ShapeSource
        ref={ref}
        id="events-source"
        shape={shape}
        cluster
        clusterRadius={CLUSTER_RADIUS}
        clusterMaxZoomLevel={CLUSTER_MAX_ZOOM}
        onPress={onPress}
      >
        <Mapbox.SymbolLayer
          id="cluster-count"
          filter={['has', 'point_count']}
          style={{
            textField: ['get', 'point_count_abbreviated'],
            textSize: 13,
            textColor: '#ffffff',
            // Halo preto opaco e grosso + número sempre opaco → contraste em
            // qualquer fundo (o pico do heatmap é amarelo bem claro).
            textHaloColor: '#000000',
            textHaloWidth: 2,
            textHaloBlur: 0.4,
            textOpacity: 1,
            textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            textIgnorePlacement: true,
            textAllowOverlap: true,
            // Ignora a iluminação do tema (lightPreset 'night') → cor fiel.
            textEmissiveStrength: 1,
          }}
        />
        <Mapbox.CircleLayer
          id="clusters"
          belowLayerID="cluster-count"
          filter={['has', 'point_count']}
          style={{
            circleColor: VIOLET_600,
            circleStrokeColor: '#ffffff',
            circleStrokeWidth: 2,
            circleOpacity: opacity,
            circleStrokeOpacity: opacity,
            circleRadius: ['step', ['get', 'point_count'], 16, 10, 20, 30, 24],
            circleEmissiveStrength: 1,
          }}
        />
        <Mapbox.CircleLayer
          id="single-points"
          filter={['!', ['has', 'point_count']]}
          style={{
            circleColor: VIOLET_600,
            circleStrokeColor: '#ffffff',
            circleStrokeWidth: 2,
            circleOpacity: opacity,
            circleStrokeOpacity: opacity,
            circleRadius: 10,
            circleEmissiveStrength: 1,
          }}
        />
      </Mapbox.ShapeSource>
    )
  },
)
