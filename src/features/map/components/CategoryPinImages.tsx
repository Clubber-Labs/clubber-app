import { View } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { Circle, Path } from 'react-native-svg'
import { colors } from '@/shared/theme'
import { EmojiPinFace } from '@/shared/components/EmojiPinFace'
import {
  CATEGORY_EMOJIS,
  FALLBACK_CATEGORY_EMOJI,
  FALLBACK_CATEGORY_KEY,
} from '@/shared/utils/eventCategoryEmoji'
import {
  pinTailHeight,
  pinTailPath,
  PIN_RIM_COLOR,
  PIN_RIM_WIDTH,
} from '../utils/markerLayout'

export const CATEGORY_PIN_PREFIX = 'event-cat-'
// A ponta fica PAD acima da base da view do snapshot — o iconOffset desce o
// ícone pra ponta cravar na coordenada.
export const CATEGORY_PIN_TIP_OFFSET: [number, number] = [0, 2]

// Mesmo tamanho do EventPin do zoom alto — o pin não muda ao cruzar o
// threshold de zoom.
const PIN_SIZE = 54
const PAD = 2

const ENTRIES: [string, string][] = [
  ...Object.entries(CATEGORY_EMOJIS),
  [FALLBACK_CATEGORY_KEY, FALLBACK_CATEGORY_EMOJI],
]

// Uma imagem de pin por categoria, registrada por snapshot de view local —
// o emoji vem do próprio sistema. (Snapshot só é instável com foto remota;
// conteúdo local renderiza síncrono.)
export function CategoryPinImages() {
  const height = PIN_SIZE + pinTailHeight(PIN_SIZE)
  const inner = PIN_SIZE - 6
  return (
    <Mapbox.Images>
      {ENTRIES.map(([key, emoji]) => (
        <Mapbox.Image key={key} name={`${CATEGORY_PIN_PREFIX}${key}`}>
          {/* collapsable={false}: o Fabric achataria este View layout-only e
              promoveria os filhos a subviews diretas do Image, que aceita
              só uma ("Image supports max 1 subview"). */}
          <View
            collapsable={false}
            style={{ width: PIN_SIZE + PAD * 2, height: height + PAD * 2 }}
          >
            <Svg
              width={PIN_SIZE + 4}
              height={height + 4}
              viewBox={`-2 -2 ${PIN_SIZE + 4} ${height + 4}`}
              style={{ position: 'absolute', left: PAD - 2, top: PAD - 2 }}
            >
              <Circle
                cx={PIN_SIZE / 2}
                cy={PIN_SIZE / 2}
                r={PIN_SIZE / 2 + PIN_RIM_WIDTH}
                fill={PIN_RIM_COLOR}
              />
              <Path
                d={pinTailPath(PIN_SIZE, PIN_RIM_WIDTH)}
                fill={PIN_RIM_COLOR}
              />
              <Circle
                cx={PIN_SIZE / 2}
                cy={PIN_SIZE / 2}
                r={PIN_SIZE / 2}
                fill={colors.content}
              />
              <Path d={pinTailPath(PIN_SIZE)} fill={colors.content} />
            </Svg>
            <View style={{ position: 'absolute', left: PAD + 3, top: PAD + 3 }}>
              <EmojiPinFace size={inner} emoji={emoji} />
            </View>
          </View>
        </Mapbox.Image>
      ))}
    </Mapbox.Images>
  )
}
