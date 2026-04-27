import { forwardRef } from 'react'
import Mapbox from '@rnmapbox/maps'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS, VIOLET_600 } from '../constants'

type Props = {
  shape: GeoJSON.FeatureCollection
  onPress: (event: { features: GeoJSON.Feature[] }) => void
}

export const EventClustersLayer = forwardRef<Mapbox.ShapeSource, Props>(
  function EventClustersLayer({ shape, onPress }, ref) {
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
            textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            textIgnorePlacement: true,
            textAllowOverlap: true,
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
            circleRadius: ['step', ['get', 'point_count'], 16, 10, 20, 30, 24],
          }}
        />
        <Mapbox.CircleLayer
          id="single-points"
          filter={['!', ['has', 'point_count']]}
          style={{
            circleColor: VIOLET_600,
            circleStrokeColor: '#ffffff',
            circleStrokeWidth: 2,
            circleRadius: 10,
          }}
        />
      </Mapbox.ShapeSource>
    )
  },
)
