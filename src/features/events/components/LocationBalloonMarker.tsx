import Mapbox from '@rnmapbox/maps'
import Svg, { Path } from 'react-native-svg'
import { colors } from '@/shared/theme'

const WIDTH = 44
const HEIGHT = 46

// Balão de conversa (💬): caixa arredondada com rabinho caindo pra
// baixo-esquerda, desenhado como um path único pra borda contornar tudo.
const BALLOON_PATH = [
  'M 12 2 H 32',
  'Q 42 2 42 12 V 22',
  'Q 42 32 32 32 H 22',
  'L 9 43 L 14 32 H 8',
  'Q 2 32 2 26 V 12',
  'Q 2 2 12 2 Z',
].join(' ')

// Ponta do rabinho (9,43) + respiro da borda — é ela que aponta o local.
const TAIL_TIP_ANCHOR = { x: 9 / WIDTH, y: 44 / HEIGHT }

type Props = {
  id: string
  coordinate: [number, number]
}

export function LocationBalloonMarker({ id, coordinate }: Props) {
  return (
    <Mapbox.MarkerView
      id={id}
      coordinate={coordinate}
      anchor={TAIL_TIP_ANCHOR}
      allowOverlap
    >
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Path
          d={BALLOON_PATH}
          fill={colors.brand}
          stroke={colors.content}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    </Mapbox.MarkerView>
  )
}
