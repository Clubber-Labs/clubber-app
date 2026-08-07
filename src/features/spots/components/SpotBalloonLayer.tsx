import { useMemo } from 'react'
import Mapbox from '@rnmapbox/maps'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'
import spotBalloonMini from '../assets/spot-balloon-mini.png'

type Props = {
  spots: Spot[]
  onPress: (spot: Spot) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

// Balões de spot no zoom baixo, como STYLE LAYER (não MarkerView): view RN
// sempre renderiza acima de style layer, então pôr os spots por baixo das
// gotas de evento exige os dois como layers. Sem foto — a essa distância o
// detalhe é ilegível; entra a contagem de membros, e o balão completo volta
// no zoom alto.
const MINI_IMAGE = 'spot-balloon-mini'
// Caixa do balão ocupa 192 dos 208px da arte; ponta do rabinho em (32,240).
const IMAGE_BOX_PX = 192
const BOX_SCREEN = 26
const ICON_SIZE = BOX_SCREEN / IMAGE_BOX_PX
// Da âncora 'bottom' (104,248) até a ponta: +72 à direita, +8 pra baixo.
const TIP_OFFSET: [number, number] = [72, 8]
const COUNT_SIZE = 11
// Centro da caixa relativo à âncora: deslocamento do ícone (72,8) + vetor do
// bottom-center da arte ao centro da caixa (0,-144), em px da arte → ems.
const COUNT_OFFSET: [number, number] = [
  (72 * ICON_SIZE) / COUNT_SIZE,
  ((8 - 144) * ICON_SIZE) / COUNT_SIZE,
]

export function SpotBalloonLayer({ spots, onPress, dimmed }: Props) {
  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: spots.map(spot => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [spot.longitude, spot.latitude],
        },
        properties: { spotId: spot.id, memberCount: spot.memberCount },
      })),
    }),
    [spots],
  )

  function handlePress(event: { features: GeoJSON.Feature[] }) {
    const spotId = event.features[0]?.properties?.spotId
    const found = spots.find(spot => spot.id === spotId)
    if (found) onPress(found)
  }

  return (
    <>
      <Mapbox.Images images={{ [MINI_IMAGE]: spotBalloonMini }} />
      <Mapbox.ShapeSource
        id="spots-mini-source"
        shape={shape}
        onPress={handlePress}
      >
        <Mapbox.SymbolLayer
          id="spots-mini"
          style={{
            iconImage: MINI_IMAGE,
            iconAnchor: 'bottom',
            iconOffset: TIP_OFFSET,
            iconSize: ICON_SIZE,
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
            iconOpacity: dimmed ? 0.5 : 1,
            // Ignora a iluminação do tema (lightPreset 'night') → cor fiel.
            iconEmissiveStrength: 1,
            // Contagem de membros no centro da caixa — sempre visível,
            // inclusive "1": sem foto nessa distância, o número é o conteúdo
            // do balão (miolo escuro vazio leria como marcador quebrado).
            textField: ['to-string', ['get', 'memberCount']],
            textSize: COUNT_SIZE,
            textColor: colors.content,
            textHaloColor: colors.background,
            textHaloWidth: 1.2,
            textHaloBlur: 0.3,
            textFont: ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            textOffset: COUNT_OFFSET,
            textAllowOverlap: true,
            textIgnorePlacement: true,
            textOpacity: dimmed ? 0.5 : 1,
            textEmissiveStrength: 1,
          }}
        />
      </Mapbox.ShapeSource>
    </>
  )
}
