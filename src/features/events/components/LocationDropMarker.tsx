import { View } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { Circle, Path } from 'react-native-svg'
import { colors } from '@/shared/theme'
import { EmojiPinFace } from '@/shared/components/EmojiPinFace'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'

const SIZE = 60

// Mesma arte da gota de evento do mapa, na proporção do canvas 74×74 da
// silhueta (casca branca + rim + miolo com o emoji da categoria). Âncora na
// ponta — ela aponta o local exato.
const TIP_ANCHOR = { x: 0.5, y: 71 / 74 }
const FACE_LEFT = (13 / 74) * SIZE
const FACE_TOP = (6 / 74) * SIZE
const FACE_SIZE = (48 / 74) * SIZE

type Props = {
  id: string
  coordinate: [number, number]
  categories?: string[]
}

export function LocationDropMarker({ id, coordinate, categories = [] }: Props) {
  return (
    <Mapbox.MarkerView
      id={id}
      coordinate={coordinate}
      anchor={TIP_ANCHOR}
      allowOverlap
    >
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 74 74">
          {/* Contorno escuro sutil: silhueta legível nos lightPresets claros. */}
          <Circle cx={37} cy={30} r={28.6} fill="rgba(0,0,0,0.30)" />
          <Path
            d="M 8.4 30 Q 8.4 51.3 37 72.6 Q 65.6 51.3 65.6 30 Z"
            fill="rgba(0,0,0,0.30)"
          />
          <Circle cx={37} cy={30} r={27} fill={colors.content} />
          <Path
            d="M 10 30 Q 10 50.5 37 71 Q 64 50.5 64 30 Z"
            fill={colors.content}
          />
        </Svg>
        <View style={{ position: 'absolute', left: FACE_LEFT, top: FACE_TOP }}>
          <EmojiPinFace
            size={FACE_SIZE}
            emoji={eventCategoryEmoji(categories)}
          />
        </View>
      </View>
    </Mapbox.MarkerView>
  )
}
