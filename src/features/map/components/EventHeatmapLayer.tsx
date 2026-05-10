import { useMemo } from 'react'
import Mapbox from '@rnmapbox/maps'
import type { HeatmapPoint } from '../services/mapService'

type Props = {
  points: HeatmapPoint[]
}

export function EventHeatmapLayer({ points }: Props) {
  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: points.map(p => ({
        type: 'Feature',
        id: p.id,
        properties: { weight: p.weight },
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
      })),
    }),
    [points],
  )

  return (
    <Mapbox.ShapeSource id="events-heatmap-source" shape={shape}>
      <Mapbox.HeatmapLayer
        id="events-heatmap"
        sourceID="events-heatmap-source"
        style={{
          // Peso vem do backend (2× confirmados + interessados); normalizamos
          // pra heatmap-weight em [0..1] assumindo 20 como max esperado.
          heatmapWeight: [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0,
            0,
            20,
            1,
          ],
          // Raio cresce com zoom pra blobs ficarem proporcionais
          heatmapRadius: ['interpolate', ['linear'], ['zoom'], 0, 12, 16, 50],
          heatmapIntensity: ['interpolate', ['linear'], ['zoom'], 0, 1, 16, 3],
          heatmapColor: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 0, 0, 0)',
            0.2,
            'rgba(34, 197, 94, 0.6)',
            0.4,
            'rgba(234, 179, 8, 0.75)',
            0.6,
            'rgba(249, 115, 22, 0.85)',
            0.8,
            'rgba(239, 68, 68, 0.95)',
            1,
            'rgba(220, 38, 38, 1)',
          ],
          heatmapOpacity: 0.75,
        }}
      />
    </Mapbox.ShapeSource>
  )
}
