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
          // Quente / fogo: amarelo → laranja → vermelho → vermelho escuro.
          // Vívido e bem visível — os pins ficam semi-transparentes por cima.
          // Inferno (viridis): colormap perceptualmente uniforme, com luminosidade
          // monotônica (o brilho cresce com a densidade) — ótimo no fundo escuro e
          // grayscale-safe. Esparso some no escuro; denso brilha. Preto → roxo →
          // magenta → vermelho → laranja → amarelo. Alpha cresce pro fade nas bordas.
          heatmapColor: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 0, 4, 0)',
            0.13,
            'rgba(27, 12, 66, 0.35)',
            0.25,
            'rgba(75, 12, 107, 0.5)',
            0.38,
            'rgba(120, 28, 109, 0.64)',
            0.5,
            'rgba(165, 44, 96, 0.75)',
            0.63,
            'rgba(207, 68, 70, 0.84)',
            0.75,
            'rgba(237, 105, 37, 0.9)',
            0.88,
            'rgba(251, 154, 6, 0.96)',
            1,
            'rgba(252, 255, 164, 1)',
          ],
          heatmapOpacity: 0.8,
        }}
      />
    </Mapbox.ShapeSource>
  )
}
